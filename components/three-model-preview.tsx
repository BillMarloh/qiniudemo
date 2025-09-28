"use client"

import { Suspense, useRef, useState, useEffect, Component, ReactNode } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei'
import { useModelStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Eye,
  Download,
  Share2,
  Maximize,
  Sun,
  Palette,
  Move3D,
  ZoomIn,
  RotateCw,
  Play,
  Pause,
} from 'lucide-react'
import * as THREE from 'three'
import { toast } from "sonner"

// 3D模型组件
function Model({ url, hasModel }: { url: string; hasModel: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // 自动旋转
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  // 如果没有模型，显示备用模型
  if (!hasModel) {
    return <FallbackModel />
  }

  // 如果URL是GLTF格式，使用useGLTF加载
  if (url.includes('.gltf') || url.includes('.glb') || url.includes('/api/')) {
    try {
      const { scene } = useGLTF(url)
      
      // 确保模型居中并适当缩放
      if (scene) {
        scene.position.set(0, 0, 0)
        scene.scale.setScalar(1)
      }
      
      return <primitive object={scene} ref={meshRef} />
    } catch (error) {
      console.error('Failed to load GLTF model:', error)
      return <FallbackModel />
    }
  }

  // 默认几何体
  return <FallbackModel />
}

// 备用模型（当无法加载真实模型时）
function FallbackModel() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  )
}

// 加载状态组件
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b7280" transparent opacity={0.5} />
    </mesh>
  )
}

// 自定义错误边界组件
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Canvas Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">3D渲染错误</div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => this.setState({ hasError: false })}
            >
              重试
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ThreeModelPreview() {
  const { modelData } = useModelStore()
  const [isRotating, setIsRotating] = useState(true)
  const [zoom, setZoom] = useState([1])
  const [lightIntensity, setLightIntensity] = useState([75])
  const [viewMode, setViewMode] = useState("perspective")
  const [materialType, setMaterialType] = useState("default")
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc")

  const exportFormats = [
    { value: "obj", label: "OBJ" },
    { value: "gltf", label: "GLTF" },
    { value: "stl", label: "STL" },
    { value: "fbx", label: "FBX" },
    { value: "dae", label: "DAE" },
  ]

  const handleDownload = async (selectedFormat?: string) => {
    if (modelData?.modelUrl) {
      const format = selectedFormat || modelData.format
      toast.info(`开始下载: ${modelData.name} (${format.toUpperCase()})`)
      
      try {
        // 如果是GLB格式，直接下载
        if (format === 'glb' || format === 'gltf') {
          const link = document.createElement('a')
          link.href = modelData.modelUrl
          link.download = `${modelData.name}.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          // 其他格式需要转换
          await convertAndDownloadModel(modelData.modelUrl, modelData.name, format)
        }
        
        setTimeout(() => {
          toast.success(`下载完成！格式: ${format.toUpperCase()}`)
        }, 1000)
      } catch (error) {
        console.error('下载失败:', error)
        toast.error('下载失败，请重试')
      }
    } else {
      toast.error('没有可下载的模型')
    }
  }

  // 模型格式转换和下载
  const convertAndDownloadModel = async (modelUrl: string, modelName: string, targetFormat: string) => {
    try {
      // 这里应该调用后端API进行格式转换
      const response = await fetch('/api/convert-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelUrl,
          targetFormat,
          modelName
        })
      })

      if (!response.ok) {
        throw new Error('格式转换失败')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${modelName}.${targetFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('格式转换失败:', error)
      // 如果转换失败，下载原始格式
      toast.warning(`格式转换失败，下载原始格式: ${modelData?.format}`)
      const link = document.createElement('a')
      link.href = modelUrl
      link.download = `${modelName}.${modelData?.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShare = async () => {
    if (modelData) {
      try {
        await navigator.share({
          title: modelData.name,
          text: modelData.description,
          url: window.location.href,
        })
      } catch (error) {
        // 如果navigator.share不可用，复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href)
        alert('链接已复制到剪贴板')
      }
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>3D预览</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={modelData ? "default" : "secondary"}>
              {modelData ? "已加载" : "等待生成"}
            </Badge>
            {modelData?.provider === 'lightweight-3d' && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                轻量级3D
              </Badge>
            )}
            {process.env.NODE_ENV === 'development' && (
              <Badge variant="outline" className="text-xs">
                演示模式
              </Badge>
            )}
            {modelData && (
              <Badge variant="outline" className="text-xs">
                {modelData.format?.toUpperCase() || 'GLB'}
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 3D Canvas */}
        <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50 overflow-hidden">
          {/* 错误状态显示 */}
          {modelData && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
                <span className="text-muted-foreground">模型: </span>
                <span className="font-medium">{modelData.name}</span>
              </div>
            </div>
          )}
          
          <CanvasErrorBoundary>
            <Canvas
              camera={{ position: [5, 5, 5], fov: 50 }}
              style={{ height: '400px', width: '100%' }}
              onCreated={({ gl }) => {
                // 处理WebGL上下文丢失
                gl.domElement.addEventListener('webglcontextlost', (event) => {
                  event.preventDefault()
                  console.warn('WebGL context lost')
                })
                
                gl.domElement.addEventListener('webglcontextrestored', () => {
                  console.log('WebGL context restored')
                })
              }}
              gl={{ 
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true
              }}
            >
            {/* 光照设置 */}
            <ambientLight intensity={lightIntensity[0] / 100} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* 移除Environment组件以避免加载立方体贴图文件 */}

            {/* 模型 */}
            <Suspense fallback={<LoadingFallback />}>
              <Model 
                key={modelData?.id || 'default'} // 添加key确保重新渲染
                url={modelData?.modelUrl || '/api/demo-model'} 
                hasModel={!!modelData}
              />
            </Suspense>

            {/* 控制器 */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={isRotating}
              autoRotateSpeed={2}
            />

            {/* 阴影 */}
            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4.5}
            />
            </Canvas>
          </CanvasErrorBoundary>

          {/* 覆盖控制 */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setIsRotating(!isRotating)} 
              className="glass"
            >
              {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" size="sm" className="glass">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* 视图模式选择器 */}
          <div className="absolute bottom-4 left-4">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perspective">透视图</SelectItem>
                <SelectItem value="front">正视图</SelectItem>
                <SelectItem value="side">侧视图</SelectItem>
                <SelectItem value="top">俯视图</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 控制标签页 */}
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view">视图</TabsTrigger>
            <TabsTrigger value="material">材质</TabsTrigger>
            <TabsTrigger value="export">导出</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center space-x-2">
                  <ZoomIn className="h-4 w-4" />
                  <span>缩放: {Math.round(zoom[0] * 100)}%</span>
                </Label>
                <Slider 
                  value={zoom} 
                  onValueChange={setZoom} 
                  min={0.5} 
                  max={2} 
                  step={0.1} 
                  className="w-full" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <span>光照强度: {lightIntensity[0]}%</span>
                </Label>
                <Slider
                  value={lightIntensity}
                  onValueChange={setLightIntensity}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">背景颜色</Label>
                <div className="flex space-x-2">
                  {["#f8fafc", "#1f2937", "#3b82f6", "#10b981"].map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      style={{ backgroundColor: color }}
                      onClick={() => setBackgroundColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Move3D className="h-4 w-4 mr-2" />
                  重置视角
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCw className="h-4 w-4 mr-2" />
                  自动旋转
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="material" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">材质类型</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">默认</SelectItem>
                    <SelectItem value="metal">金属</SelectItem>
                    <SelectItem value="wood">木质</SelectItem>
                    <SelectItem value="plastic">塑料</SelectItem>
                    <SelectItem value="glass">玻璃</SelectItem>
                    <SelectItem value="ceramic">陶瓷</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {["#3b82f6", "#ef4444", "#10b981", "#f59e0b"].map((color, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 p-0 bg-transparent"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <Palette className="h-4 w-4 mr-2" />
                自定义颜色
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">导出格式</Label>
                <Select defaultValue={modelData?.format || "glb"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">分辨率</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低 (512x512)</SelectItem>
                    <SelectItem value="medium">中 (1024x1024)</SelectItem>
                    <SelectItem value="high">高 (2048x2048)</SelectItem>
                    <SelectItem value="ultra">超高 (4096x4096)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button disabled={!modelData} onClick={() => handleDownload()}>
                  <Download className="h-4 w-4 mr-2" />
                  下载模型 ({modelData?.format?.toUpperCase() || 'GLB'})
                </Button>
                <Button variant="outline" disabled={!modelData} onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  分享链接
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
