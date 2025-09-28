import { useState } from 'react'
import { useModelStore } from '@/lib/store'
import { Lightweight3DService, Lightweight3DOptions, Lightweight3DError } from '@/lib/lightweight-3d'
import { toast } from 'sonner'

export interface Lightweight3DParams {
  textPrompt?: string
  imageFile?: File
  options: {
    quality: number
    complexity: number
    style: string
    material: string
    model_type?: string
  }
}

export interface Lightweight3DResult {
  id: string
  modelUrl: string
  thumbnailUrl: string
  name: string
  description: string
  format: string
  modelType: string
  generationTime: string
}

export function useLightweight3D() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { setLoading, setError, setProgress, setModelData, addModel } = useModelStore()

  const generateModel = async (params: Lightweight3DParams): Promise<Lightweight3DResult | null> => {
    setIsGenerating(true)
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      let response

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

      if (params.textPrompt) {
        // 文本生成3D
        const options: Lightweight3DOptions = {
          quality: params.options.quality,
          complexity: params.options.complexity,
          style: params.options.style,
          material: params.options.material,
          model_type: params.options.model_type || 'shap-e'
        }
        
        response = await Lightweight3DService.textTo3D(params.textPrompt, options)
      } else if (params.imageFile) {
        // 图片生成3D
        const imageBase64 = await Lightweight3DService.fileToBase64(params.imageFile)
        const options: Lightweight3DOptions = {
          quality: params.options.quality,
          complexity: params.options.complexity,
          style: params.options.style,
          material: params.options.material,
          model_type: params.options.model_type || 'zero123'
        }
        
        response = await Lightweight3DService.imageTo3D(imageBase64, options)
      } else {
        throw new Error('请提供文本描述或上传图片')
      }

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.success) {
        throw new Error(response.error || '生成失败')
      }

      // 构建结果对象
      const result: Lightweight3DResult = {
        id: response.task_id,
        modelUrl: response.result?.mesh_url || '/api/demo-model',
        thumbnailUrl: response.result?.thumbnail_url || '/placeholder.jpg',
        name: params.textPrompt ? params.textPrompt.slice(0, 30) : '图片生成模型',
        description: params.textPrompt || '从图片生成的3D模型',
        format: response.result?.format || 'glb',
        modelType: response.result?.model_type || 'shap-e',
        generationTime: response.result?.generation_time || '45秒'
      }
      
      // 更新store
      const modelData = {
        id: result.id,
        name: result.name,
        description: result.description,
        modelUrl: result.modelUrl,
        thumbnailUrl: result.thumbnailUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'current-user',
        tags: [result.modelType],
        format: result.format,
        size: 1024 * 1024, // 模拟1MB
        provider: 'lightweight-3d'
      }

      setModelData(modelData)
      addModel(modelData)
      
      console.log('轻量级3D模型生成完成:', result)
      
      toast.success(`3D模型生成成功！使用模型: ${result.modelType}`)
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成过程中发生未知错误'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('轻量级3D生成错误:', error)
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

export function useLightweight3DAPI() {
  const [isLoading, setIsLoading] = useState(false)

  const getModelsInfo = async () => {
    setIsLoading(true)
    try {
      const info = await Lightweight3DService.getModelsInfo()
      return info
    } catch (error) {
      console.error('获取模型信息失败:', error)
      toast.error('获取模型信息失败')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const getServiceStatus = async () => {
    setIsLoading(true)
    try {
      const status = await Lightweight3DService.getServiceStatus()
      return status
    } catch (error) {
      console.error('获取服务状态失败:', error)
      return {
        message: "轻量级3D服务离线",
        available_models: [],
        gpu_info: { available: false, device_name: "Unknown", memory_gb: 0 }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const validateTextPrompt = (prompt: string) => {
    return Lightweight3DService.validateTextPrompt(prompt)
  }

  const validateImageFile = (file: File) => {
    return Lightweight3DService.validateImageFile(file)
  }

  const estimateGenerationTime = (options: Lightweight3DOptions, mode: string) => {
    return Lightweight3DService.estimateGenerationTime(options, mode)
  }

  return {
    getModelsInfo,
    getServiceStatus,
    validateTextPrompt,
    validateImageFile,
    estimateGenerationTime,
    isLoading,
  }
}
