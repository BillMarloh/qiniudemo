"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, User, Settings, Menu, X, Cable as Cube, Home, Library, HelpCircle, LogOut, CreditCard, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useModelStore } from "@/lib/store"
import { toast } from "sonner"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 模拟登录状态
  const [userCredits, setUserCredits] = useState(85) // 模拟用户积分
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 搜索功能
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.info(`搜索: ${searchQuery}`)
      // 这里可以添加实际的搜索逻辑
      console.log('搜索查询:', searchQuery)
    }
  }

  // 导航功能
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      toast.info(`跳转到${sectionId}`)
    }
    setIsMobileMenuOpen(false)
  }

  // 用户操作
  const handleLogout = () => {
    setIsLoggedIn(false)
    toast.success('已退出登录')
  }

  const handleProfile = () => {
    toast.info('打开个人资料')
  }

  const handleSettings = () => {
    toast.info('打开设置')
  }

  const handleCredits = () => {
    toast.info('查看积分详情')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Cube className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-primary/20 blur-sm" />
              </div>
              <span className="text-xl font-bold gradient-text">Model3D</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>首页</span>
            </button>
            <button
              onClick={() => scrollToSection('generation')}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <Cube className="h-4 w-4" />
              <span>生成</span>
            </button>
            <button
              onClick={() => scrollToSection('library')}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <Library className="h-4 w-4" />
              <span>模型库</span>
            </button>
            <button
              onClick={() => scrollToSection('help')}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <HelpCircle className="h-4 w-4" />
              <span>帮助</span>
            </button>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* User Credits */}
            <div className="hidden sm:flex items-center space-x-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <CreditCard className="h-3 w-3 mr-1" />
                {userCredits} 积分
              </Badge>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="搜索模型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-muted/50 border-border/50 focus:bg-background"
              />
            </form>

            {/* User Menu */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                    <User className="h-4 w-4" />
                    <span className="sr-only">用户菜单</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">用户</p>
                      <p className="text-xs text-muted-foreground">user@example.com</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>个人资料</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>设置</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCredits}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>积分管理</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>通知</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => toast.info('请先登录')}>
                登录
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4">
            <div className="flex flex-col space-y-3">
              {/* Mobile Search */}
              <div className="px-3 pb-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="搜索模型..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/50 border-border/50" 
                  />
                </form>
              </div>

              {/* Mobile Credits */}
              <div className="px-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <CreditCard className="h-3 w-3 mr-1" />
                  {userCredits} 积分
                </Badge>
              </div>

              {/* Mobile Navigation */}
              <button
                onClick={() => scrollToSection('hero')}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>首页</span>
              </button>
              <button
                onClick={() => scrollToSection('generation')}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <Cube className="h-4 w-4" />
                <span>生成</span>
              </button>
              <button
                onClick={() => scrollToSection('library')}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <Library className="h-4 w-4" />
                <span>模型库</span>
              </button>
              <button
                onClick={() => scrollToSection('help')}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span>帮助</span>
              </button>

              {/* Mobile User Actions */}
              <div className="px-3 pt-3 border-t border-border/40">
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm" onClick={handleProfile} className="justify-start">
                    <User className="h-4 w-4 mr-2" />
                    个人资料
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSettings} className="justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    设置
                  </Button>
                  {isLoggedIn ? (
                    <Button variant="destructive" size="sm" onClick={handleLogout} className="justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => toast.info('请先登录')}>
                      登录
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
