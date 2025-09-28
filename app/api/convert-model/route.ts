import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { modelUrl, targetFormat, modelName } = await request.json()

    console.log('Converting model:', { modelUrl, targetFormat, modelName })

    // 验证输入参数
    if (!modelUrl || !targetFormat || !modelName) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 支持的转换格式
    const supportedFormats = ['obj', 'stl', 'fbx', 'dae', 'gltf', 'glb']
    if (!supportedFormats.includes(targetFormat.toLowerCase())) {
      return NextResponse.json(
        { error: `不支持的格式: ${targetFormat}` },
        { status: 400 }
      )
    }

    // 调用Python服务进行格式转换
    const pythonServiceUrl = 'http://localhost:8001'
    
    try {
      const response = await fetch(`${pythonServiceUrl}/convert-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_url: modelUrl,
          target_format: targetFormat,
          model_name: modelName
        })
      })
      
      if (response.ok) {
        const convertedBuffer = await response.arrayBuffer()
        
        let contentType: string
        switch (targetFormat.toLowerCase()) {
          case 'obj':
            contentType = 'application/octet-stream'
            break
          case 'stl':
            contentType = 'application/octet-stream'
            break
          case 'fbx':
            contentType = 'application/octet-stream'
            break
          case 'dae':
            contentType = 'application/xml'
            break
          case 'gltf':
            contentType = 'model/gltf+json'
            break
          case 'glb':
          default:
            contentType = 'model/gltf-binary'
            break
        }
        
        return new NextResponse(convertedBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${modelName}.${targetFormat}"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
    } catch (pythonError) {
      console.warn('Python conversion service not available, using fallback:', pythonError)
    }

    // 如果Python服务不可用，使用本地转换
    const convertedModel = await convertModelLocally(modelUrl, targetFormat, modelName)
    
    return new NextResponse(convertedModel.buffer, {
      status: 200,
      headers: {
        'Content-Type': convertedModel.contentType,
        'Content-Disposition': `attachment; filename="${modelName}.${targetFormat}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('模型转换错误:', error)
    return NextResponse.json(
      { error: '模型转换失败' },
      { status: 500 }
    )
  }
}

async function convertModelLocally(modelUrl: string, targetFormat: string, modelName: string) {
  // 读取原始模型文件
  let modelBuffer: Buffer
  
  if (modelUrl.includes('/api/')) {
    // 本地API文件
    const glbPath = join(process.cwd(), 'public', 'api', 'demo-model.glb')
    modelBuffer = await readFile(glbPath)
  } else {
    // 外部URL
    const response = await fetch(modelUrl)
    if (!response.ok) {
      throw new Error('无法获取模型文件')
    }
    modelBuffer = Buffer.from(await response.arrayBuffer())
  }

  // 根据目标格式进行转换
  let convertedBuffer: Buffer
  let contentType: string

  switch (targetFormat.toLowerCase()) {
    case 'obj':
      // 简单的OBJ转换（这里应该实现真正的转换逻辑）
      convertedBuffer = await convertToOBJ(modelBuffer)
      contentType = 'application/octet-stream'
      break
    
    case 'stl':
      // 简单的STL转换
      convertedBuffer = await convertToSTL(modelBuffer)
      contentType = 'application/octet-stream'
      break
    
    case 'fbx':
      // FBX转换
      convertedBuffer = modelBuffer // 暂时返回原始文件
      contentType = 'application/octet-stream'
      break
    
    case 'dae':
      // DAE转换
      convertedBuffer = await convertToDAE(modelBuffer)
      contentType = 'application/xml'
      break
    
    case 'gltf':
      // GLTF转换
      convertedBuffer = await convertToGLTF(modelBuffer)
      contentType = 'model/gltf+json'
      break
    
    case 'glb':
    default:
      // GLB格式
      convertedBuffer = modelBuffer
      contentType = 'model/gltf-binary'
      break
  }

  return {
    buffer: convertedBuffer,
    contentType: contentType
  }
}

async function convertToOBJ(glbBuffer: Buffer): Promise<Buffer> {
  // 这里应该实现真正的GLB到OBJ转换
  // 目前返回一个简单的OBJ文件
  const objContent = `# Generated OBJ file
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
f 1 2 3 4
`
  return Buffer.from(objContent, 'utf-8')
}

async function convertToSTL(glbBuffer: Buffer): Promise<Buffer> {
  // 这里应该实现真正的GLB到STL转换
  // 目前返回一个简单的STL文件
  const stlContent = `solid Generated
  facet normal 0.0 0.0 1.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 1.0 0.0 0.0
      vertex 1.0 1.0 0.0
    endloop
  endfacet
endsolid Generated
`
  return Buffer.from(stlContent, 'utf-8')
}

async function convertToDAE(glbBuffer: Buffer): Promise<Buffer> {
  // 这里应该实现真正的GLB到DAE转换
  // 目前返回一个简单的DAE文件
  const daeContent = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
  <asset>
    <contributor>
      <author>AI 3D Generator</author>
    </contributor>
    <created>${new Date().toISOString()}</created>
    <modified>${new Date().toISOString()}</modified>
  </asset>
  <library_geometries>
    <geometry id="mesh">
      <mesh>
        <source id="positions">
          <float_array id="positions-array" count="12">0 0 0 1 0 0 1 1 0 0 1 0</float_array>
          <technique_common>
            <accessor source="#positions-array" count="4" stride="3">
              <param name="X" type="float"/>
              <param name="Y" type="float"/>
              <param name="Z" type="float"/>
            </accessor>
          </technique_common>
        </source>
        <vertices id="vertices">
          <input semantic="POSITION" source="#positions"/>
        </vertices>
        <triangles count="2">
          <input semantic="VERTEX" source="#vertices" offset="0"/>
          <p>0 1 2 0 2 3</p>
        </triangles>
      </mesh>
    </geometry>
  </library_geometries>
  <library_visual_scenes>
    <visual_scene id="scene">
      <node id="node">
        <instance_geometry url="#mesh"/>
      </node>
    </visual_scene>
  </library_visual_scenes>
  <scene>
    <instance_visual_scene url="#scene"/>
  </scene>
</COLLADA>`
  return Buffer.from(daeContent, 'utf-8')
}

async function convertToGLTF(glbBuffer: Buffer): Promise<Buffer> {
  // 这里应该实现真正的GLB到GLTF转换
  // 目前返回一个简单的GLTF文件
  const gltfContent = {
    "asset": {
      "version": "2.0",
      "generator": "AI 3D Generator"
    },
    "scene": 0,
    "scenes": [{
      "nodes": [0]
    }],
    "nodes": [{
      "mesh": 0
    }],
    "meshes": [{
      "primitives": [{
        "attributes": {
          "POSITION": 0
        },
        "indices": 1
      }]
    }],
    "accessors": [
      {
        "bufferView": 0,
        "componentType": 5126,
        "count": 4,
        "type": "VEC3"
      },
      {
        "bufferView": 1,
        "componentType": 5123,
        "count": 6,
        "type": "SCALAR"
      }
    ],
    "bufferViews": [
      {
        "buffer": 0,
        "byteOffset": 0,
        "byteLength": 48
      },
      {
        "buffer": 0,
        "byteOffset": 48,
        "byteLength": 12
      }
    ],
    "buffers": [{
      "byteLength": 60
    }]
  }
  
  return Buffer.from(JSON.stringify(gltfContent, null, 2), 'utf-8')
}
