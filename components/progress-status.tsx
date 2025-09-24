"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Clock, X, RefreshCw } from "lucide-react"

interface ProgressStatusProps {
  isGenerating: boolean
  progress: number
  onCancel?: () => void
  onRetry?: () => void
}

export function ProgressStatus({ isGenerating, progress, onCancel, onRetry }: ProgressStatusProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [hasError, setHasError] = useState(false)

  const steps = [
    { name: "解析输入", description: "分析文本描述或图片内容" },
    { name: "生成网格", description: "创建3D几何结构" },
    { name: "应用材质", description: "添加纹理和材质效果" },
    { name: "优化模型", description: "优化模型结构和性能" },
    { name: "完成渲染", description: "最终渲染和质量检查" },
  ]

  useEffect(() => {
    if (isGenerating) {
      const stepProgress = progress / 20
      setCurrentStep(Math.floor(stepProgress))
      setEstimatedTime(Math.max(0, Math.round((100 - progress) / 8)))
    }
  }, [isGenerating, progress])

  if (!isGenerating && progress === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-medium text-primary">
              {hasError ? "生成失败" : progress >= 100 ? "生成完成" : "正在生成模型..."}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {hasError ? (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                错误
              </Badge>
            ) : progress >= 100 ? (
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                完成
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                {Math.round(progress)}%
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">进度</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {estimatedTime > 0 && <div className="text-sm text-muted-foreground">预计剩余时间: {estimatedTime} 秒</div>}

        {/* Step Indicators */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                index < currentStep
                  ? "bg-primary/10 text-primary"
                  : index === currentStep
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "bg-primary/50 text-primary-foreground animate-pulse"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? <CheckCircle className="w-3 h-3" /> : index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {hasError ? (
            <Button onClick={onRetry} size="sm" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          ) : isGenerating ? (
            <Button onClick={onCancel} variant="outline" size="sm" className="flex-1 bg-transparent">
              <X className="w-4 h-4 mr-2" />
              取消生成
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
