import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get('prompt') || ''
    
    console.log('Generating cat model for prompt:', prompt)
    
    // 根据提示词生成不同的猫咪模型
    let glbPath: string
    
    // 目前所有猫咪模型都使用同一个文件，但可以根据提示词进行不同的处理
    if (prompt.includes('橙色') || prompt.includes('橘色')) {
      glbPath = join(process.cwd(), 'public', 'api', 'orange-cat-model.glb')
    } else if (prompt.includes('黑色') || prompt.includes('黑猫')) {
      glbPath = join(process.cwd(), 'public', 'api', 'black-cat-model.glb')
    } else if (prompt.includes('白色') || prompt.includes('白猫')) {
      glbPath = join(process.cwd(), 'public', 'api', 'white-cat-model.glb')
    } else {
      glbPath = join(process.cwd(), 'public', 'api', 'cat-model.glb')
    }
    
    try {
      await readFile(glbPath)
    } catch {
      // 如果指定的猫咪模型不存在，使用默认模型
      glbPath = join(process.cwd(), 'public', 'api', 'demo-model.glb')
    }
    
    const glbBuffer = await readFile(glbPath)
    
    // 返回GLB文件
    return new NextResponse(glbBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Model-Prompt': prompt // 添加提示词信息到响应头
      }
    })
  } catch (error) {
    console.error('Error serving cat model GLB file:', error)
    return new NextResponse('Cat model GLB file not found', { status: 404 })
  }
}
