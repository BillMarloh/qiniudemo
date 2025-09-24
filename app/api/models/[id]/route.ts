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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const model = mockModels.find(m => m.id === id)

    if (!model) {
      return NextResponse.json(
        { error: '模型不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(model)

  } catch (error) {
    console.error('获取模型详情错误:', error)
    return NextResponse.json(
      { error: '获取模型详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, tags } = body

    const modelIndex = mockModels.findIndex(m => m.id === id)
    if (modelIndex === -1) {
      return NextResponse.json(
        { error: '模型不存在' },
        { status: 404 }
      )
    }

    // 更新模型信息
    const updatedModel = {
      ...mockModels[modelIndex],
      ...(name && { name }),
      ...(description && { description }),
      ...(tags && { tags }),
      updatedAt: new Date().toISOString()
    }

    mockModels[modelIndex] = updatedModel

    return NextResponse.json(updatedModel)

  } catch (error) {
    console.error('更新模型错误:', error)
    return NextResponse.json(
      { error: '更新模型失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const modelIndex = mockModels.findIndex(m => m.id === id)

    if (modelIndex === -1) {
      return NextResponse.json(
        { error: '模型不存在' },
        { status: 404 }
      )
    }

    // 删除模型
    mockModels.splice(modelIndex, 1)

    return NextResponse.json(
      { message: '模型删除成功' },
      { status: 200 }
    )

  } catch (error) {
    console.error('删除模型错误:', error)
    return NextResponse.json(
      { error: '删除模型失败' },
      { status: 500 }
    )
  }
}
