import { NextRequest, NextResponse } from 'next/server'
import { Hunyuan3DService, Hunyuan3DUtils, Hunyuan3DError } from '@/lib/hunyuan-3d'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const meshFile = formData.get('meshFile') as File
    const imageFile = formData.get('imageFile') as File
    const optionsString = formData.get('options') as string
    const userId = formData.get('userId') as string || 'anonymous'
    
    if (!meshFile || !imageFile) {
      return NextResponse.json(
        { error: '需要提供网格文件和参考图片' },
        { status: 400 }
      )
    }

    const options = JSON.parse(optionsString)

    // 验证文件
    const meshValidation = Hunyuan3DUtils.validateImageFile(meshFile) // 复用图片验证逻辑
    const imageValidation = Hunyuan3DUtils.validateImageFile(imageFile)
    
    if (!meshValidation.valid) {
      return NextResponse.json(
        { error: meshValidation.message },
        { status: 400 }
      )
    }

    if (!imageValidation.valid) {
      return NextResponse.json(
        { error: imageValidation.message },
        { status: 400 }
      )
    }

    try {
      // 将文件转换为base64
      const meshBase64 = await Hunyuan3DService.fileToBase64(meshFile)
      const imageBase64 = await Hunyuan3DService.fileToBase64(imageFile)

      // 调用混元3D纹理合成API
      const hunyuanResponse = await Hunyuan3DService.generateTexture(
        meshBase64,
        imageBase64,
        options
      )

      if (!hunyuanResponse || !hunyuanResponse.task_id) {
        throw new Error('混元3D响应无效')
      }

      const taskId = hunyuanResponse.task_id

      // 轮询任务状态直到完成
      const finalStatus = await Hunyuan3DService.pollTaskCompletion(
        taskId,
        (progress) => {
          console.log(`混元3D纹理合成进度: ${progress}%`)
        }
      )

      if (finalStatus.status !== 'COMPLETED' || !finalStatus.result) {
        throw new Hunyuan3DError('纹理合成失败', 500, taskId)
      }

      // 生成模型ID
      const modelId = `texture_${Date.now()}`
      
      // 创建模型数据
      const modelData = {
        id: modelId,
        name: `纹理合成_${Date.now()}`,
        description: '通过混元3D生成的纹理模型',
        modelUrl: finalStatus.result.mesh_url,
        textureUrl: finalStatus.result.texture_url,
        thumbnailUrl: finalStatus.result.thumbnail_url,
        format: finalStatus.result.format || 'glb',
        size: Math.floor(Math.random() * 10000000) + 1000000,
        createdAt: new Date().toISOString(),
        taskId,
        options,
        provider: 'hunyuan3d',
        type: 'texture_synthesis'
      }

      return NextResponse.json(modelData)

    } catch (hunyuanError) {
      console.error('混元3D纹理合成错误:', hunyuanError)
      
      if (hunyuanError instanceof Hunyuan3DError) {
        return NextResponse.json(
          { error: hunyuanError.message, taskId: hunyuanError.taskId },
          { status: hunyuanError.statusCode || 500 }
        )
      }

      return NextResponse.json(
        { error: '混元3D纹理合成失败，请稍后重试' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('纹理合成错误:', error)
    return NextResponse.json(
      { error: '纹理合成失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: '混元3D纹理合成API端点' },
    { status: 200 }
  )
}

