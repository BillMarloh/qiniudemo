"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  RotateCcw,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function ModelPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [zoom, setZoom] = useState([100])
  const [lightIntensity, setLightIntensity] = useState([75])
  const [viewMode, setViewMode] = useState("perspective")
  const [materialType, setMaterialType] = useState("default")
  const [hasModel, setHasModel] = useState(false)

  // Simulate 3D model loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasModel(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Simple 3D visualization placeholder
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
        // Draw a simple 3D-like cube as placeholder
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const size = 80 * (zoom[0] / 100)

        ctx.save()
        ctx.translate(centerX, centerY)

        if (isRotating) {
          rotation += 0.02
        }

        ctx.rotate(rotation)

        // Draw cube faces with different shades
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
        // Loading state
        ctx.fillStyle = "#374151"
        ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100)
        ctx.fillStyle = "#6b7280"
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("加载中...", canvas.width / 2, canvas.height / 2 + 80)
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

  const exportFormats = [
    { value: "obj", label: "OBJ" },
    { value: "gltf", label: "GLTF" },
    { value: "stl", label: "STL" },
    { value: "fbx", label: "FBX" },
    { value: "dae", label: "DAE" },
  ]

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>3D预览</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={hasModel ? "default" : "secondary"}>{hasModel ? "已加载" : "等待生成"}</Badge>
            <Button variant="ghost" size="sm">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 3D Canvas */}
        <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50 overflow-hidden">
          <canvas ref={canvasRef} width={400} height={300} className="w-full h-[300px] object-contain" />

          {/* Overlay Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button variant="secondary" size="sm" onClick={() => setIsRotating(!isRotating)} className="glass">
              {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" size="sm" className="glass">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* View Mode Selector */}
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

        {/* Control Tabs */}
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
                  <span>缩放: {zoom[0]}%</span>
                </Label>
                <Slider value={zoom} onValueChange={setZoom} min={25} max={200} step={25} className="w-full" />
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
                <Select defaultValue="obj">
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
                <Button disabled={!hasModel}>
                  <Download className="h-4 w-4 mr-2" />
                  下载模型
                </Button>
                <Button variant="outline" disabled={!hasModel}>
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
