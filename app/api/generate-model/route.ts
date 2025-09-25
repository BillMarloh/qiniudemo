import { NextRequest, NextResponse } from 'next/server'
import { Hunyuan3DService, Hunyuan3DUtils, Hunyuan3DError } from '@/lib/hunyuan-3d'
import { SupabaseService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const textPrompt = formData.get('textPrompt') as string
    const imageFile = formData.get('imageFile') as File
    const optionsString = formData.get('options') as string
    const userId = formData.get('userId') as string || 'anonymous'
    
    if (!textPrompt && !imageFile) {
      return NextResponse.json(
        { error: '需要提供文本描述或图片' },
        { status: 400 }
      )
    }

    const options = JSON.parse(optionsString)

    // 验证输入
    if (textPrompt) {
      const validation = Hunyuan3DUtils.validateTextPrompt(textPrompt)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.message },
          { status: 400 }
        )
      }
    }

    if (imageFile) {
      const validation = Hunyuan3DUtils.validateImageFile(imageFile)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.message },
          { status: 400 }
        )
      }
    }

    let hunyuanResponse
    let modelName = ''

    try {
      if (textPrompt) {
        // 文本生成3D模型
        modelName = textPrompt.slice(0, 30) + (textPrompt.length > 30 ? '...' : '')
        hunyuanResponse = await Hunyuan3DService.textTo3D(textPrompt, options)
      } else if (imageFile) {
        // 图片生成3D模型
        modelName = `从图片生成的3D模型_${Date.now()}`
        
        // 将图片转换为base64
        const imageBase64 = await Hunyuan3DService.fileToBase64(imageFile)
        hunyuanResponse = await Hunyuan3DService.imageTo3D(imageBase64, options)
      }

      if (!hunyuanResponse || !hunyuanResponse.task_id) {
        throw new Error('混元3D响应无效')
      }

      const taskId = hunyuanResponse.task_id

      // 轮询任务状态直到完成
      const finalStatus = await Hunyuan3DService.pollTaskCompletion(
        taskId,
        (progress) => {
          // 这里可以通过WebSocket或其他方式实时更新进度
          console.log(`混元3D生成进度: ${progress}%`)
        }
      )

      if (finalStatus.status !== 'COMPLETED' || !finalStatus.result) {
        throw new Hunyuan3DError('模型生成失败', 500, taskId)
      }

      // 生成模型ID
      const modelId = `model_${Date.now()}`
      
      // 创建模型数据
      const modelData = {
        id: modelId,
        name: modelName,
        description: textPrompt || '从图片生成的3D模型',
        modelUrl: finalStatus.result.mesh_url,
        thumbnailUrl: finalStatus.result.thumbnail_url,
        textureUrl: finalStatus.result.texture_url,
        format: finalStatus.result.format || 'glb',
        size: Math.floor(Math.random() * 10000000) + 1000000, // 1-10MB
        createdAt: new Date().toISOString(),
        taskId,
        options,
        provider: 'hunyuan3d'
      }

      // 在演示模式下，我们直接返回模拟数据
      // 在实际应用中，这里会保存到Supabase
      return NextResponse.json(modelData)

    } catch (hunyuanError) {
      console.error('混元3D错误:', hunyuanError)
      
      if (hunyuanError instanceof Hunyuan3DError) {
        return NextResponse.json(
          { error: hunyuanError.message, taskId: hunyuanError.taskId },
          { status: hunyuanError.statusCode || 500 }
        )
      }

      return NextResponse.json(
        { error: '混元3D模型生成失败，请稍后重试' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('模型生成错误:', error)
    return NextResponse.json(
      { error: '模型生成失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: '模型生成API端点' },
    { status: 200 }
  )
}
