import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model_type, quality, num_steps, image_base64 } = await request.json()
    
    console.log('Generating real 3D model with prompt:', prompt)
    
    // 调用Python服务进行真正的3D模型生成
    const pythonServiceUrl = 'http://localhost:8001'
    
    let response
    if (image_base64) {
      // 图片生成3D
      response = await fetch(`${pythonServiceUrl}/generate/image-to-3d`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: image_base64,
          model_type: model_type || 'zero123',
          quality: quality || 'medium'
        })
      })
    } else {
      // 文本生成3D
      response = await fetch(`${pythonServiceUrl}/generate/text-to-3d`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model_type: model_type || 'shap-e',
          quality: quality || 'medium',
          num_steps: num_steps || 20
        })
      })
    }
    
    if (!response.ok) {
      throw new Error(`Python service error: ${response.status}`)
    }
    
    const result = await response.json()
    
    // 返回生成结果
    return NextResponse.json({
      success: true,
      task_id: result.task_id || `real_${Date.now()}`,
      status: result.status || 'completed',
      result: {
        mesh_url: result.mesh_url || result.result?.mesh_url,
        thumbnail_url: result.thumbnail_url || result.result?.thumbnail_url,
        format: result.format || 'glb',
        model_type: model_type,
        generation_time: result.generation_time || '2分钟'
      }
    })
    
  } catch (error) {
    console.error('Error calling Python service:', error)
    
    // 如果Python服务不可用，返回错误信息
    return NextResponse.json({
      success: false,
      error: 'Python 3D generation service is not available. Please start the Python service first.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
