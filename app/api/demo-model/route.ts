import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // 读取GLB文件
    const glbPath = join(process.cwd(), 'public', 'api', 'demo-model.glb')
    const glbBuffer = await readFile(glbPath)
    
    // 返回GLB文件
    return new NextResponse(glbBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error serving GLB file:', error)
    return new NextResponse('GLB file not found', { status: 404 })
  }
}
