import { useState } from 'react'
import { useModelStore } from '@/lib/store'
import { toast } from 'sonner'

export interface GenerateModelParams {
  textPrompt?: string
  imageFile?: File
  options: {
    quality: number
    complexity: number
    style: string
    material: string
  }
}

export interface ModelGenerationResult {
  id: string
  modelUrl: string
  thumbnailUrl: string
  textureUrl?: string
  name: string
  description: string
  format: string
  size: number
  provider?: string
}

export function useGenerateModel() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { setLoading, setError, setProgress, setModelData, addModel } = useModelStore()

  const generateModel = async (params: GenerateModelParams): Promise<ModelGenerationResult | null> => {
    setIsGenerating(true)
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // 创建FormData
      const formData = new FormData()
      
      if (params.textPrompt) {
        formData.append('textPrompt', params.textPrompt)
      }
      
      if (params.imageFile) {
        formData.append('imageFile', params.imageFile)
      }
      
      formData.append('options', JSON.stringify(params.options))

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 500)

      // 发送请求到API
      const response = await fetch('/api/generate-model', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '生成失败')
      }

      const result: ModelGenerationResult = await response.json()
      
      // 更新store
      const modelData = {
        id: result.id,
        name: result.name,
        description: result.description,
        modelUrl: result.modelUrl,
        thumbnailUrl: result.thumbnailUrl,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(),
        userId: 'current-user', // 这里应该从认证状态获取
        tags: [],
        format: result.format,
        size: result.size
      }

      setModelData(modelData)
      addModel(modelData)
      
      console.log('模型数据已更新:', modelData)
      
      toast.success('3D模型生成成功！')
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成过程中发生未知错误'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setIsGenerating(false)
      setLoading(false)
      // 延迟重置进度条
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return {
    generateModel,
    isGenerating,
  }
}

export function useModelAPI() {
  const { setUserModels, updateModel, deleteModel } = useModelStore()

  const fetchUserModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) throw new Error('获取模型列表失败')
      
      const models = await response.json()
      setUserModels(models)
      return models
    } catch (error) {
      console.error('获取模型列表失败:', error)
      toast.error('获取模型列表失败')
      return []
    }
  }

  const fetchModel = async (id: string) => {
    try {
      const response = await fetch(`/api/models/${id}`)
      if (!response.ok) throw new Error('获取模型详情失败')
      
      const model = await response.json()
      return model
    } catch (error) {
      console.error('获取模型详情失败:', error)
      toast.error('获取模型详情失败')
      return null
    }
  }

  const updateModelInfo = async (id: string, updates: Partial<{ name: string; description: string; tags: string[] }>) => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('更新模型信息失败')
      
      const updatedModel = await response.json()
      updateModel(id, updatedModel)
      toast.success('模型信息更新成功')
      return updatedModel
    } catch (error) {
      console.error('更新模型信息失败:', error)
      toast.error('更新模型信息失败')
      return null
    }
  }

  const deleteModelAPI = async (id: string) => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除模型失败')
      
      deleteModel(id)
      toast.success('模型删除成功')
      return true
    } catch (error) {
      console.error('删除模型失败:', error)
      toast.error('删除模型失败')
      return false
    }
  }

  return {
    fetchUserModels,
    fetchModel,
    updateModelInfo,
    deleteModelAPI,
  }
}
