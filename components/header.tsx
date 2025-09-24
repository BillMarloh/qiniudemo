"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, User, Settings, Menu, X, Cable as Cube, Home, Library, HelpCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
            <a
              href="#"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>首页</span>
            </a>
            <a
              href="#"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <Cube className="h-4 w-4" />
              <span>生成</span>
            </a>
            <a
              href="#"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <Library className="h-4 w-4" />
              <span>模型库</span>
            </a>
            <a
              href="#"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <HelpCircle className="h-4 w-4" />
              <span>帮助</span>
            </a>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索模型..."
                className="pl-10 w-64 bg-muted/50 border-border/50 focus:bg-background"
              />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                  <User className="h-4 w-4" />
                  <span className="sr-only">用户菜单</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>个人资料</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
              <div className="px-3 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="搜索模型..." className="pl-10 bg-muted/50 border-border/50" />
                </div>
              </div>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>首页</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <Cube className="h-4 w-4" />
                <span>生成</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <Library className="h-4 w-4" />
                <span>模型库</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span>帮助</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
