"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Type, ImageIcon, Sparkles, Zap, Globe, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text")

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full" />
      </div>

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI驱动的3D模型生成
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
            <span className="gradient-text">从想象到现实</span>
            <br />
            <span className="text-foreground">创造精美3D模型</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-12 max-w-3xl mx-auto leading-relaxed">
            使用先进的AI技术，从文本描述或图片创建专业级3D模型。
            <br />
            让创意无限，让设计更简单。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="btn-hover px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setActiveTab("text")}
            >
              <Type className="w-5 h-5 mr-2" />
              文本生成
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-hover px-8 py-4 text-lg font-semibold border-2 hover:bg-muted/50 transition-all duration-300 bg-transparent"
              onClick={() => setActiveTab("image")}
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              图片生成
            </Button>
          </div>

          {/* Feature Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">10秒</div>
              <div className="text-sm text-muted-foreground">平均生成时间</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">50+</div>
              <div className="text-sm text-muted-foreground">支持格式</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">100K+</div>
              <div className="text-sm text-muted-foreground">活跃用户</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
