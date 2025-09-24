"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Type, ImageIcon, Upload, Wand2, Settings, Sparkles, RotateCcw, History, Save, FolderOpen } from "lucide-react"
import { ProgressStatus } from "@/components/progress-status"
import { useGenerateModel } from "@/hooks/useGenerateModel"
import { useModelStore } from "@/lib/store"

export function GenerationWorkspace() {
  const [activeTab, setActiveTab] = useState("text")
  const [textPrompt, setTextPrompt] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null)
  const [quality, setQuality] = useState([75])
  const [complexity, setComplexity] = useState([50])
  const [style, setStyle] = useState("realistic")
  const [material, setMaterial] = useState("default")
  
  const { generateModel, isGenerating } = useGenerateModel()
  const { progress, setProgress, setGenerationOptions } = useModelStore()

  const presetPrompts = [
    "一只可爱的卡通猫咪，坐着的姿势",
    "现代简约风格的椅子设计",
    "科幻风格的宇宙飞船",
    "古典欧式建筑立柱",
    "抽象艺术雕塑",
    "精致的茶壶，陶瓷材质",
    "未来主义机器人",
    "复古汽车模型",
  ]

  const recentPrompts = ["蓝色的现代沙发", "木质餐桌，圆形", "金属质感的台灯"]

  const handleGenerate = async () => {
    // 更新生成选项
    setGenerationOptions({
      quality: quality[0],
      complexity: complexity[0],
      style,
      material
    })

    // 调用API生成模型
    const result = await generateModel({
      textPrompt: activeTab === "text" ? textPrompt : undefined,
      imageFile: activeTab === "image" ? uploadedImageFile || undefined : undefined,
      options: {
        quality: quality[0],
        complexity: complexity[0],
        style,
        material
      }
    })

    if (result) {
      console.log('模型生成成功:', result)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <span>生成工作台</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>文本生成</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>图片生成</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">描述您想要的3D模型</Label>
                <Textarea
                  id="prompt"
                  placeholder="例如：一只可爱的卡通猫咪，橙色毛发，绿色眼睛，坐着的姿势，卡通风格，高质量建模..."
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="text-xs text-muted-foreground">提示：详细的描述能帮助生成更准确的3D模型</div>
              </div>

              {/* Recent Prompts */}
              {recentPrompts.length > 0 && (
                <div className="space-y-2">
                  <Label>最近使用</Label>
                  <div className="flex flex-wrap gap-2">
                    {recentPrompts.map((prompt, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => setTextPrompt(prompt)}
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preset Prompts */}
              <div className="space-y-2">
                <Label>预设提示词</Label>
                <div className="flex flex-wrap gap-2">
                  {presetPrompts.map((prompt, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => setTextPrompt(prompt)}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="space-y-2">
                <Label>上传参考图片</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded reference"
                        className="max-w-full max-h-48 mx-auto rounded-lg"
                      />
                      <Button variant="outline" size="sm" onClick={() => setUploadedImage(null)}>
                        重新上传
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">拖拽图片到此处或点击上传</p>
                      <p className="text-xs text-muted-foreground">支持 JPG, PNG, WebP 格式，最大 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-prompt">补充描述（可选）</Label>
                <Textarea
                  id="image-prompt"
                  placeholder="为图片添加更多描述信息，如材质、风格、细节要求..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Generation Parameters */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">生成参数</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">质量等级: {quality[0]}%</Label>
                <Slider value={quality} onValueChange={setQuality} max={100} step={25} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>标准</span>
                  <span>高清</span>
                  <span>超清</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">复杂度: {complexity[0]}%</Label>
                <Slider value={complexity} onValueChange={setComplexity} max={100} step={25} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>简单</span>
                  <span>中等</span>
                  <span>复杂</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">风格</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">写实风格</SelectItem>
                    <SelectItem value="cartoon">卡通风格</SelectItem>
                    <SelectItem value="abstract">抽象风格</SelectItem>
                    <SelectItem value="minimalist">极简风格</SelectItem>
                    <SelectItem value="lowpoly">低面数</SelectItem>
                    <SelectItem value="detailed">高细节</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">材质</Label>
                <Select value={material} onValueChange={setMaterial}>
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
                    <SelectItem value="fabric">布料</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating || (!textPrompt && activeTab === "text") || (!uploadedImage && activeTab === "image")
              }
              className="flex-1 btn-hover"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "生成中..." : "开始生成"}
            </Button>
            <Button variant="outline" size="icon" disabled={isGenerating}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Status */}
      <ProgressStatus
        isGenerating={isGenerating}
        progress={progress}
        onCancel={() => setProgress(0)}
        onRetry={handleGenerate}
      />
    </div>
  )
}
