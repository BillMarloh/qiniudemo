"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useModelStore } from "@/lib/store"
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
} from "lucide-react"
import { toast } from "sonner"

export function SimpleModelPreview() {
  const { modelData } = useModelStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [zoom, setZoom] = useState([100])
  const [lightIntensity, setLightIntensity] = useState([75])
  const [hasModel, setHasModel] = useState(false)

  // 模拟3D模型加载
  useEffect(() => {
    if (modelData) {
      setHasModel(true)
    } else {
      setHasModel(false)
    }
  }, [modelData])

  // 简单的3D可视化
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let rotation = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (hasModel) {
        // 绘制一个简单的3D立方体
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const size = 80 * (zoom[0] / 100)

        ctx.save()
        ctx.translate(centerX, centerY)

        if (isRotating) {
          rotation += 0.02
        }

        ctx.rotate(rotation)

        // 绘制立方体面
        const faces = [
          { x: -size / 2, y: -size / 2, w: size, h: size, color: "#3b82f6" },
          { x: size / 2, y: -size / 2, w: size / 3, h: size, color: "#1d4ed8" },
          { x: -size / 2, y: size / 2, w: size, h: size / 3, color: "#1e40af" },
        ]

        faces.forEach((face) => {
          ctx.fillStyle = face.color
          ctx.fillRect(face.x, face.y, face.w, face.h)
          ctx.strokeStyle = "#1f2937"
          ctx.lineWidth = 2
          ctx.strokeRect(face.x, face.y, face.w, face.h)
        })

        ctx.restore()
      } else {
        // 加载状态
        ctx.fillStyle = "#374151"
        ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100)
        ctx.fillStyle = "#6b7280"
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("等待生成...", canvas.width / 2, canvas.height / 2 + 80)
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [hasModel, isRotating, zoom])

  const [selectedFormat, setSelectedFormat] = useState('glb')

  const handleDownload = async (format?: string) => {
    if (modelData?.modelUrl) {
      const downloadFormat = format || selectedFormat
      toast.info(`开始下载: ${modelData.name} (${downloadFormat.toUpperCase()})`)
      
      try {
        // 如果是GLB格式，直接下载
        if (downloadFormat === 'glb' || downloadFormat === 'gltf') {
          const link = document.createElement('a')
          link.href = modelData.modelUrl
          link.download = `${modelData.name}.${downloadFormat}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          // 其他格式需要转换
          await convertAndDownloadModel(modelData.modelUrl, modelData.name, downloadFormat)
        }
        
        setTimeout(() => {
          toast.success(`下载完成！格式: ${downloadFormat.toUpperCase()}`)
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
        await navigator.clipboard.writeText(window.location.href)
        toast.success('链接已复制到剪贴板')
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
            <Badge variant={hasModel ? "default" : "secondary"}>
              {hasModel ? "已加载" : "等待生成"}
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
          {modelData && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
                <span className="text-muted-foreground">模型: </span>
                <span className="font-medium">{modelData.name}</span>
              </div>
            </div>
          )}
          
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={300} 
            className="w-full h-[300px] object-contain" 
          />

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
        </div>

        {/* 控制面板 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm flex items-center space-x-2">
              <ZoomIn className="h-4 w-4" />
              <span>缩放: {zoom[0]}%</span>
            </label>
            <input
              type="range"
              min="25"
              max="200"
              step="25"
              value={zoom[0]}
              onChange={(e) => setZoom([parseInt(e.target.value)])}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <span>光照强度: {lightIntensity[0]}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={lightIntensity[0]}
              onChange={(e) => setLightIntensity([parseInt(e.target.value)])}
              className="w-full"
            />
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

          <div className="space-y-2">
            <label className="text-sm">导出格式</label>
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="glb">GLB</option>
              <option value="obj">OBJ</option>
              <option value="stl">STL</option>
              <option value="fbx">FBX</option>
              <option value="dae">DAE</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button disabled={!modelData} onClick={() => handleDownload()}>
              <Download className="h-4 w-4 mr-2" />
              下载模型 ({selectedFormat.toUpperCase()})
            </Button>
            <Button variant="outline" disabled={!modelData} onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              分享链接
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
