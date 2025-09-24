"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Crown, Zap, Download, Heart, TrendingUp, Clock } from "lucide-react"

export function UserCenter() {
  const [activeTab, setActiveTab] = useState("overview")

  const userStats = {
    modelsGenerated: 156,
    totalDownloads: 2340,
    favoriteModels: 89,
    accountType: "Pro",
    creditsUsed: 750,
    creditsTotal: 1000,
    joinDate: "2023-06-15",
  }

  const recentActivity = [
    { type: "generate", name: "可爱卡通猫咪", time: "2小时前" },
    { type: "download", name: "现代简约椅子", time: "5小时前" },
    { type: "like", name: "科幻宇宙飞船", time: "1天前" },
    { type: "generate", name: "古典建筑立柱", time: "2天前" },
  ]

  const subscriptionPlans = [
    {
      name: "免费版",
      price: "¥0",
      period: "永久",
      credits: 50,
      features: ["基础模型生成", "标准质量", "5个导出格式"],
      current: false,
    },
    {
      name: "专业版",
      price: "¥99",
      period: "月",
      credits: 1000,
      features: ["高级模型生成", "超高质量", "所有导出格式", "优先处理", "无水印"],
      current: true,
    },
    {
      name: "企业版",
      price: "¥299",
      period: "月",
      credits: 5000,
      features: ["无限模型生成", "最高质量", "API访问", "团队协作", "专属支持"],
      current: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">用户中心</h2>
          <p className="text-muted-foreground mt-2">管理您的账户和订阅</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          设置
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
          <TabsTrigger value="subscription">订阅管理</TabsTrigger>
          <TabsTrigger value="settings">账户设置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold">创意设计师</h3>
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                      <Crown className="h-3 w-3 mr-1" />
                      {userStats.accountType}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">加入时间: {userStats.joinDate}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {userStats.creditsUsed}/{userStats.creditsTotal}
                  </div>
                  <div className="text-sm text-muted-foreground">积分余额</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{userStats.modelsGenerated}</div>
                <div className="text-sm text-muted-foreground">生成模型</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{userStats.totalDownloads}</div>
                <div className="text-sm text-muted-foreground">总下载量</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-2xl font-bold">{userStats.favoriteModels}</div>
                <div className="text-sm text-muted-foreground">收藏模型</div>
              </CardContent>
            </Card>
          </div>

          {/* Credits Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>积分使用情况</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>已使用: {userStats.creditsUsed}</span>
                <span>总额度: {userStats.creditsTotal}</span>
              </div>
              <Progress value={(userStats.creditsUsed / userStats.creditsTotal) * 100} />
              <div className="text-xs text-muted-foreground">
                剩余 {userStats.creditsTotal - userStats.creditsUsed} 积分，预计可生成{" "}
                {Math.floor((userStats.creditsTotal - userStats.creditsUsed) / 10)} 个模型
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>最近活动</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "generate"
                          ? "bg-blue-500/10"
                          : activity.type === "download"
                            ? "bg-green-500/10"
                            : "bg-red-500/10"
                      }`}
                    >
                      {activity.type === "generate" && <Zap className="h-4 w-4 text-blue-500" />}
                      {activity.type === "download" && <Download className="h-4 w-4 text-green-500" />}
                      {activity.type === "like" && <Heart className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.type === "generate" && "生成了模型"}
                        {activity.type === "download" && "下载了模型"}
                        {activity.type === "like" && "收藏了模型"}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.current ? "border-primary shadow-lg" : ""}`}>
                {plan.current && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">当前计划</Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{plan.credits}</div>
                    <div className="text-sm text-muted-foreground">积分/月</div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                    {plan.current ? "当前计划" : "升级"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
