import { NextRequest, NextResponse } from 'next/server'

// 模拟数据库中的模型数据
const mockModels = [
  {
    id: 'model_1',
    name: '可爱的卡通猫咪',
    description: '一只橙色毛发，绿色眼睛的卡通风格猫咪，坐着的姿势',
    modelUrl: '/api/placeholder-model.glb',
    thumbnailUrl: '/cute-cartoon-cat.png',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    userId: 'user_1',
    tags: ['动物', '卡通', '可爱'],
    format: 'glb',
    size: 2048576
  },
  {
    id: 'model_2',
    name: '现代简约椅子',
    description: '现代简约风格的椅子设计，木质材质，人体工学设计',
    modelUrl: '/api/placeholder-model.glb',
    thumbnailUrl: '/modern-minimalist-chair.jpg',
    createdAt: new Date('2024-01-14').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
    userId: 'user_1',
    tags: ['家具', '现代', '简约'],
    format: 'glb',
    size: 3145728
  },
  {
    id: 'model_3',
    name: '科幻宇宙飞船',
    description: '未来主义风格的宇宙飞船，金属质感，流线型设计',
    modelUrl: '/api/placeholder-model.glb',
    thumbnailUrl: '/sci-fi-spaceship.jpg',
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
    userId: 'user_1',
    tags: ['科幻', '太空', '未来'],
    format: 'glb',
    size: 5242880
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 模拟用户过滤
    let filteredModels = mockModels
    if (userId) {
      filteredModels = mockModels.filter(model => model.userId === userId)
    }

    // 模拟分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedModels = filteredModels.slice(startIndex, endIndex)

    return NextResponse.json({
      models: paginatedModels,
      total: filteredModels.length,
      page,
      limit,
      totalPages: Math.ceil(filteredModels.length / limit)
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
