import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { error: '需要提供用户ID' },
        { status: 400 }
      )
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 从Supabase获取模型列表
    const models = await SupabaseService.getModelsByUserId(userId, limit, offset)

    // 转换数据格式以匹配前端期望
    const formattedModels = models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      modelUrl: model.model_url,
      thumbnailUrl: model.thumbnail_url,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
      userId: model.user_id,
      tags: model.tags,
      format: model.format,
      size: model.file_size
    }))

    return NextResponse.json({
      models: formattedModels,
      total: formattedModels.length,
      page,
      limit,
      totalPages: Math.ceil(formattedModels.length / limit)
    })

  } catch (error) {
    console.error('获取模型列表错误:', error)
    return NextResponse.json(
      { error: '获取模型列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, modelUrl, thumbnailUrl, userId, tags } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      )
    }

    // 创建新模型
    const newModel = {
      id: `model_${Date.now()}`,
      name,
      description: description || '',
      modelUrl: modelUrl || '/api/placeholder-model.glb',
      thumbnailUrl: thumbnailUrl || '/placeholder.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
      tags: tags || [],
      format: 'glb',
      size: 1024000
    }

    // 在实际应用中，这里会保存到数据库
    mockModels.unshift(newModel)

    return NextResponse.json(newModel, { status: 201 })

  } catch (error) {
    console.error('创建模型错误:', error)
    return NextResponse.json(
      { error: '创建模型失败' },
      { status: 500 }
    )
  }
}
