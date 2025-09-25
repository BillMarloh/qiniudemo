"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useModelStore } from "@/lib/store"
import {
  Search,
  Grid3X3,
  List,
  Heart,
  Download,
  Share2,
  Eye,
  MoreHorizontal,
  Calendar,
  Trash2,
  Edit,
  Copy,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Model {
  id: string
  name: string
  prompt: string
  category: string
  createdAt: string
  thumbnail: string
  isLiked: boolean
  downloads: number
  fileSize: string
  format: string
}

export function ModelLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const { userModels, setModelData } = useModelStore()

  // 模拟数据
  const [models, setModels] = useState<Model[]>(() => [
    {
      id: "1",
      name: "可爱的卡通猫咪",
      prompt: "一只橙色毛发，绿色眼睛的卡通风格猫咪，坐着的姿势",
      category: "动物",
      createdAt: "2024-01-15",
      thumbnail: "/cute-cartoon-cat.png",
      isLiked: false,
      downloads: 156,
      fileSize: "2.1 MB",
      format: "GLB"
    },
    {
      id: "2",
      name: "现代简约椅子",
      prompt: "现代简约风格的椅子设计，木质材质，人体工学设计",
      category: "家具",
      createdAt: "2024-01-14",
      thumbnail: "/modern-minimalist-chair.jpg",
      isLiked: true,
      downloads: 89,
      fileSize: "3.2 MB",
      format: "GLB"
    },
    {
      id: "3",
      name: "科幻宇宙飞船",
      prompt: "未来主义风格的宇宙飞船，金属质感，流线型设计",
      category: "科幻",
      createdAt: "2024-01-13",
      thumbnail: "/sci-fi-spaceship.jpg",
      isLiked: false,
      downloads: 234,
      fileSize: "5.1 MB",
      format: "GLB"
    }
  ])

  // 交互功能
  const handleSearch = () => {
    toast.info(`搜索: ${searchQuery}`)
  }

  const handleLike = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, isLiked: !model.isLiked }
        : model
    ))
    toast.success('收藏状态已更新')
  }

  const handleDownload = (model: Model) => {
    toast.info(`开始下载: ${model.name}`)
    // 模拟下载
    setTimeout(() => {
      setModels(prev => prev.map(m => 
        m.id === model.id 
          ? { ...m, downloads: m.downloads + 1 }
          : m
      ))
      toast.success('下载完成！')
    }, 1000)
  }

  const handleShare = async (model: Model) => {
    try {
      await navigator.share({
        title: model.name,
        text: model.prompt,
        url: window.location.href,
      })
    } catch (error) {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制到剪贴板')
    }
  }

  const handleView = (model: Model) => {
    setModelData({
      id: model.id,
      name: model.name,
      description: model.prompt,
      modelUrl: `/api/placeholder-model.glb`,
      thumbnailUrl: model.thumbnail,
      createdAt: new Date(model.createdAt),
      updatedAt: new Date(),
      userId: 'current-user',
      tags: [model.category],
      format: model.format.toLowerCase(),
      size: parseInt(model.fileSize.replace(/[^\d]/g, '')) * 1024 * 1024
    })
    toast.info('模型已加载到预览器')
  }

  const handleDelete = (modelId: string) => {
    setModels(prev => prev.filter(model => model.id !== modelId))
    toast.success('模型已删除')
  }

  const handleEdit = (modelId: string) => {
    toast.info('打开编辑模式')
  }

  const handleCopy = (model: Model) => {
    navigator.clipboard.writeText(model.prompt)
    toast.success('提示词已复制到剪贴板')
  }

  const categories = [
    { value: "all", label: "全部" },
    { value: "characters", label: "角色" },
    { value: "objects", label: "物品" },
    { value: "architecture", label: "建筑" },
    { value: "vehicles", label: "载具" },
    { value: "nature", label: "自然" },
    { value: "abstract", label: "抽象" },
  ]

  const mockModels: Model[] = [
    {
      id: "1",
      name: "可爱卡通猫咪",
      prompt: "一只可爱的卡通猫咪，橙色毛发，绿色眼睛，坐着的姿势",
      category: "characters",
      createdAt: "2024-01-15",
      thumbnail: "/cute-cartoon-cat.png",
      isLiked: true,
      downloads: 156,
      fileSize: "2.3 MB",
      format: "OBJ",
    },
    {
      id: "2",
      name: "现代简约椅子",
      prompt: "现代简约风格的椅子设计，白色，流线型",
      category: "objects",
      createdAt: "2024-01-14",
      thumbnail: "/modern-minimalist-chair.jpg",
      isLiked: false,
      downloads: 89,
      fileSize: "1.8 MB",
      format: "GLTF",
    },
    {
      id: "3",
      name: "科幻宇宙飞船",
      prompt: "科幻风格的宇宙飞船，银色金属质感，未来主义设计",
      category: "vehicles",
      createdAt: "2024-01-13",
      thumbnail: "/sci-fi-spaceship.jpg",
      isLiked: true,
      downloads: 234,
      fileSize: "4.1 MB",
      format: "FBX",
    },
    {
      id: "4",
      name: "古典建筑立柱",
      prompt: "古典欧式建筑立柱，大理石材质，精细雕刻",
      category: "architecture",
      createdAt: "2024-01-12",
      thumbnail: "/classical-architecture-column.jpg",
      isLiked: false,
      downloads: 67,
      fileSize: "3.2 MB",
      format: "STL",
    },
    {
      id: "5",
      name: "抽象艺术雕塑",
      prompt: "抽象艺术雕塑，流动的形态，现代艺术风格",
      category: "abstract",
      createdAt: "2024-01-11",
      thumbnail: "/abstract-sculpture.png",
      isLiked: true,
      downloads: 123,
      fileSize: "2.7 MB",
      format: "OBJ",
    },
    {
      id: "6",
      name: "精致陶瓷茶壶",
      prompt: "精致的茶壶，白色陶瓷材质，传统中式设计",
      category: "objects",
      createdAt: "2024-01-10",
      thumbnail: "/ceramic-teapot.jpg",
      isLiked: false,
      downloads: 78,
      fileSize: "1.9 MB",
      format: "GLTF",
    },
  ]

  const filteredModels = mockModels.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || model.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "popular":
        return b.downloads - a.downloads
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const toggleLike = (modelId: string) => {
    // Toggle like functionality would be implemented here
    console.log("Toggle like for model:", modelId)
  }

  return (
    <section className="py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-balance">模型库</h2>
            <p className="text-muted-foreground mt-2">浏览和管理您的3D模型收藏</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {filteredModels.length} 个模型
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模型名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">最新</SelectItem>
                    <SelectItem value="popular">最热</SelectItem>
                    <SelectItem value="name">名称</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Models Grid/List */}
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {sortedModels.map((model) => (
            <Card key={model.id} className="group hover:shadow-lg transition-all duration-300">
              {viewMode === "grid" ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={model.thumbnail || "/placeholder.svg"}
                      alt={model.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => handleLike(model.id)}
                      >
                        <Heart className={`h-4 w-4 ${model.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-balance">{model.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{model.prompt}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>{model.createdAt}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="h-3 w-3" />
                        <span>{model.downloads}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {model.format}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {model.fileSize}
                        </Badge>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(model)}>
                            <Eye className="mr-2 h-4 w-4" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(model)}>
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(model)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            分享
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(model.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(model)}>
                            <Copy className="mr-2 h-4 w-4" />
                            复制
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(model.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={model.thumbnail || "/placeholder.svg"}
                      alt={model.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{model.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{model.prompt}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{model.createdAt}</span>
                        <span>{model.downloads} 下载</span>
                        <span>{model.format}</span>
                        <span>{model.fileSize}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleLike(model.id)}>
                        <Heart className={`h-4 w-4 ${model.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(model)}>
                            <Eye className="mr-2 h-4 w-4" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(model)}>
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(model)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            分享
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {sortedModels.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">未找到模型</h3>
                  <p className="text-muted-foreground">尝试调整搜索条件或创建新的3D模型</p>
                </div>
                <Button>开始创建</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
