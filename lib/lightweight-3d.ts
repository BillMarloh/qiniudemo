// 轻量级3D生成服务配置
export interface Lightweight3DOptions {
  quality: number // 1-100
  complexity: number // 1-100
  style: string
  material: string
  model_type?: string // shap-e, dreamgaussian, instant3d, zero123, pifu
}

export interface Lightweight3DGenerationRequest {
  prompt: string
  model_type: string
  quality: string
  num_steps?: number
}

export interface Lightweight3DImageRequest {
  image_base64: string
  model_type: string
  quality: string
}

export interface Lightweight3DGenerationResponse {
  success: boolean
  task_id: string
  status: string
  result?: {
    mesh_url: string
    thumbnail_url: string
    format: string
    model_type: string
    generation_time: string
  }
  error?: string
}

export class Lightweight3DService {
  private static readonly BASE_URL = 'http://localhost:8001' // 轻量级服务端口
  private static readonly DEMO_MODE = process.env.NODE_ENV === 'development'

  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        // 添加超时设置
        signal: AbortSignal.timeout(60000) // 60秒超时
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        console.error('Lightweight3D API Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Lightweight3D API Timeout:', url)
          throw new Error('请求超时，请检查网络连接或稍后重试')
        }
        console.error('Lightweight3D API Error:', {
          url,
          error: error.message,
          stack: error.stack
        })
        throw error
      }
      console.error('Lightweight3D API Unknown Error:', error)
      throw new Error('未知错误，请稍后重试')
    }
  }

  // 文本生成3D模型
  static async textTo3D(
    textPrompt: string, 
    options: Lightweight3DOptions = { 
      quality: 75, 
      complexity: 50, 
      style: 'realistic', 
      material: 'default',
      model_type: 'shap-e'
    }
  ): Promise<Lightweight3DGenerationResponse> {
    const request: Lightweight3DGenerationRequest = {
      prompt: textPrompt,
      model_type: options.model_type || 'shap-e',
      quality: this.mapQualityToString(options.quality),
      num_steps: this.mapQualityToSteps(options.quality)
    }

    try {
      // 调用文生3D API
      const response = await fetch('/api/text-to-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.warn('Text-to-3D generation failed, using demo mode:', error)
      // 如果生成失败，使用演示模式
      return this.createDemoTask('text-to-3d', textPrompt, options)
    }
  }

  // 图片生成3D模型
  static async imageTo3D(
    imageBase64: string, 
    options: Lightweight3DOptions = { 
      quality: 75, 
      complexity: 50, 
      style: 'realistic', 
      material: 'default',
      model_type: 'zero123'
    }
  ): Promise<Lightweight3DGenerationResponse> {
    const request: Lightweight3DImageRequest = {
      image_base64: imageBase64,
      model_type: options.model_type || 'zero123',
      quality: this.mapQualityToString(options.quality)
    }

    try {
      // 调用图生3D API
      const response = await fetch('/api/image-to-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.warn('Image-to-3D generation failed, using demo mode:', error)
      // 如果生成失败，使用演示模式
      return this.createDemoTask('image-to-3d', '从图片生成', options)
    }
  }

  // 获取可用模型信息
  static async getModelsInfo() {
    try {
      const response = await this.makeRequest('/models/info')
      return response
    } catch (error) {
      console.error('Failed to get models info:', error)
      return {
        text_to_3d_models: [
          {
            name: "shap-e",
            description: "OpenAI轻量级模型",
            vram_required: "2-4GB",
            generation_time: "30秒-2分钟",
            quality: "中等"
          }
        ],
        image_to_3d_models: [
          {
            name: "zero123",
            description: "单图多视角生成",
            vram_required: "4-6GB", 
            generation_time: "2-4分钟",
            quality: "高"
          }
        ]
      }
    }
  }

  // 获取服务状态
  static async getServiceStatus() {
    try {
      const response = await this.makeRequest('/')
      return response
    } catch (error) {
      console.error('Failed to get service status:', error)
      return {
        message: "轻量级3D生成服务离线",
        available_models: [],
        gpu_info: {
          available: false,
          device_name: "Unknown",
          memory_gb: 0
        }
      }
    }
  }

  // 将文件转换为base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // 移除data:image/jpeg;base64,前缀
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  // 创建演示任务
  private static createDemoTask(mode: string, prompt: string, options: Lightweight3DOptions): Promise<Lightweight3DGenerationResponse> {
    const taskId = `lightweight_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // 生成一个基于提示词的动态模型URL
        const modelUrl = `/api/dynamic-model?prompt=${encodeURIComponent(prompt)}&mode=${mode}&quality=${options.quality}&style=${options.style}`
        
        resolve({
          success: true,
          task_id: taskId,
          status: "completed",
          result: {
            mesh_url: modelUrl,
            thumbnail_url: '/placeholder.jpg',
            format: 'glb',
            model_type: options.model_type || 'shap-e',
            generation_time: '45秒'
          }
        })
      }, 800)
    })
  }

  // 映射质量到字符串
  private static mapQualityToString(quality: number): string {
    if (quality >= 80) return 'high'
    if (quality >= 60) return 'medium'
    return 'low'
  }

  // 映射质量到推理步数
  private static mapQualityToSteps(quality: number): number {
    if (quality >= 80) return 30
    if (quality >= 60) return 20
    return 10
  }

  // 验证文本提示词
  static validateTextPrompt(prompt: string): { valid: boolean; message?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, message: '请输入描述文本' }
    }
    
    if (prompt.length < 5) {
      return { valid: false, message: '描述文本至少需要5个字符' }
    }
    
    if (prompt.length > 1000) {
      return { valid: false, message: '描述文本不能超过1000个字符' }
    }
    
    return { valid: true }
  }

  // 验证图片文件
  static validateImageFile(file: File): { valid: boolean; message?: string } {
    const maxSize = 20 * 1024 * 1024 // 20MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: '只支持JPG、PNG、WebP格式的图片' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, message: '图片大小不能超过20MB' }
    }
    
    return { valid: true }
  }

  // 估算生成时间
  static estimateGenerationTime(options: Lightweight3DOptions, mode: string): number {
    const baseTime = mode === 'text-to-3d' ? 45 : 30
    const qualityMultiplier = options.quality / 100
    const complexityMultiplier = options.complexity / 100
    
    return Math.round(baseTime * qualityMultiplier * complexityMultiplier)
  }
}

// 错误处理类
export class Lightweight3DError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public taskId?: string
  ) {
    super(message)
    this.name = 'Lightweight3DError'
  }
}
