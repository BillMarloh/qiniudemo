import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, quality, style } = await request.json()
    
    console.log('Generating cat model with prompt:', prompt)
    
    // 模拟AI生成过程
    const generationTime = Math.random() * 2000 + 1000 // 1-3秒
    
    await new Promise(resolve => setTimeout(resolve, generationTime))
    
    // 根据提示词生成不同的猫咪特征
    const catFeatures = {
      color: extractColor(prompt),
      pose: extractPose(prompt),
      style: style || 'cartoon',
      quality: quality || 'medium'
    }
    
    // 生成模型数据（这里返回一个模拟的GLB数据）
    const modelData = generateCatModelData(catFeatures)
    
    return NextResponse.json({
      success: true,
      model: {
        id: `cat_${Date.now()}`,
        name: prompt.slice(0, 30),
        description: prompt,
        url: `/api/cat-model-data/${Date.now()}`,
        format: 'glb',
        features: catFeatures,
        generationTime: `${Math.round(generationTime)}ms`
      }
    })
    
  } catch (error) {
    console.error('Error generating cat model:', error)
    return NextResponse.json(
      { error: 'Failed to generate cat model' },
      { status: 500 }
    )
  }
}

function extractColor(prompt: string): string {
  if (prompt.includes('橙色') || prompt.includes('橘色')) return 'orange'
  if (prompt.includes('黑色') || prompt.includes('黑猫')) return 'black'
  if (prompt.includes('白色') || prompt.includes('白猫')) return 'white'
  if (prompt.includes('灰色') || prompt.includes('灰猫')) return 'gray'
  if (prompt.includes('棕色') || prompt.includes('棕猫')) return 'brown'
  return 'orange' // 默认橙色
}

function extractPose(prompt: string): string {
  if (prompt.includes('坐着') || prompt.includes('坐姿')) return 'sitting'
  if (prompt.includes('躺着') || prompt.includes('卧姿')) return 'lying'
  if (prompt.includes('站着') || prompt.includes('立姿')) return 'standing'
  if (prompt.includes('跑') || prompt.includes('奔跑')) return 'running'
  return 'sitting' // 默认坐着
}

function generateCatModelData(features: any): any {
  // 这里应该生成实际的3D模型数据
  // 目前返回模拟数据
  return {
    vertices: generateCatVertices(features),
    faces: generateCatFaces(),
    materials: generateCatMaterials(features.color),
    animations: generateCatAnimations(features.pose)
  }
}

function generateCatVertices(features: any): number[] {
  // 生成猫咪的顶点数据
  // 这是一个简化的猫咪形状
  const vertices = [
    // 头部
    0, 1, 0,    // 头顶
    -0.3, 0.8, 0,  // 左耳
    0.3, 0.8, 0,   // 右耳
    -0.2, 0.6, 0.3, // 左脸颊
    0.2, 0.6, 0.3,  // 右脸颊
    0, 0.5, 0.4,   // 鼻子
    
    // 身体
    0, 0.3, 0,    // 脖子
    -0.4, 0, 0,   // 左肩
    0.4, 0, 0,    // 右肩
    0, -0.3, 0,   // 背部
    -0.3, -0.6, 0, // 左臀
    0.3, -0.6, 0,  // 右臀
    
    // 尾巴
    0, -0.8, 0,   // 尾根
    0.2, -1, 0,   // 尾尖
  ]
  
  return vertices
}

function generateCatFaces(): number[] {
  // 生成猫咪的面数据
  return [
    // 头部三角形
    0, 1, 3,  // 头顶到左脸颊
    0, 3, 4,  // 头顶到右脸颊
    0, 4, 2,  // 头顶到右耳
    0, 2, 1,  // 头顶到左耳
    
    // 身体三角形
    6, 7, 9,  // 脖子到左肩到左臀
    6, 9, 10, // 脖子到左臀到右臀
    6, 10, 8, // 脖子到右臀到右肩
    6, 8, 7,  // 脖子到右肩到左肩
  ]
}

function generateCatMaterials(color: string): any {
  const colorMap = {
    orange: [1.0, 0.6, 0.2],
    black: [0.1, 0.1, 0.1],
    white: [0.9, 0.9, 0.9],
    gray: [0.5, 0.5, 0.5],
    brown: [0.6, 0.4, 0.2]
  }
  
  return {
    color: colorMap[color] || colorMap.orange,
    roughness: 0.8,
    metalness: 0.0
  }
}

function generateCatAnimations(pose: string): any {
  const poseMap = {
    sitting: { rotation: [0, 0, 0], position: [0, -0.2, 0] },
    lying: { rotation: [0, 0, -0.3], position: [0, -0.4, 0] },
    standing: { rotation: [0, 0, 0], position: [0, 0, 0] },
    running: { rotation: [0, 0, 0.1], position: [0, 0, 0] }
  }
  
  return poseMap[pose] || poseMap.sitting
}
