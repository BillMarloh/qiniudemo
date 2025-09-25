// Meshy AI API集成服务
export interface MeshyAIOptions {
  quality: number // 1-100
  complexity: number // 1-100
  style: string
  material: string
}

export interface MeshyGenerationRequest {
  mode: 'text-to-3d' | 'image-to-3d'
  text_prompt?: string
  image_url?: string
  negative_prompt?: string
  style?: string
  ratio?: string
  seed?: number
}

export interface MeshyGenerationResponse {
  result: string // 任务ID
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
}

export interface MeshyTaskStatus {
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  progress: number // 0-100
  result?: {
    model_urls: {
      ply: string
      glb: string
      obj: string
    }
    thumbnail_url: string
  }
  error?: string
}

export class MeshyAIService {
  private static readonly BASE_URL = process.env.MESHY_BASE_URL || 'https://api.meshy.ai/v2'
  private static readonly API_KEY = process.env.MESHY_API_KEY!
  private static readonly DEMO_MODE = process.env.NODE_ENV === 'development' || !process.env.MESHY_API_KEY

  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // 处理特定的错误情况
      if (errorData.message && errorData.message.includes('NoMorePendingTasks')) {
        throw new MeshyAIError(
          'Meshy AI免费计划已不支持创建任务，请升级到付费计划或使用演示模式',
          403,
          undefined
        )
      }
      
      throw new MeshyAIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      )
    }

    return response.json()
  }

  // 文本生成3D模型
  static async textTo3D(
    textPrompt: string, 
    options: MeshyAIOptions = { quality: 75, complexity: 50, style: 'realistic', material: 'default' }
  ): Promise<MeshyGenerationResponse> {
    // 演示模式
    if (this.DEMO_MODE) {
      return this.createDemoTask('text-to-3d', textPrompt, options)
    }

    const request: MeshyGenerationRequest = {
      mode: 'text-to-3d',
      text_prompt: textPrompt,
      style: options.style,
      negative_prompt: 'blurry, low quality, distorted, deformed',
    }

    return this.makeRequest('/text-to-3d', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // 图片生成3D模型
  static async imageTo3D(
    imageUrl: string, 
    options: MeshyAIOptions = { quality: 75, complexity: 50, style: 'realistic', material: 'default' }
  ): Promise<MeshyGenerationResponse> {
    // 演示模式
    if (this.DEMO_MODE) {
      return this.createDemoTask('image-to-3d', '从图片生成', options)
    }

    const request: MeshyGenerationRequest = {
      mode: 'image-to-3d',
      image_url: imageUrl,
      style: options.style,
      ratio: '1:1',
    }

    return this.makeRequest('/image-to-3d', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // 查询任务状态
  static async getTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
    // 演示模式
    if (this.DEMO_MODE) {
      return this.getDemoTaskStatus(taskId)
    }

    return this.makeRequest(`/text-to-3d/${taskId}`)
  }

  // 创建演示任务
  private static createDemoTask(mode: string, prompt: string, options: MeshyAIOptions): Promise<MeshyGenerationResponse> {
    const taskId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 模拟任务创建
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          result: taskId,
          status: 'SUBMITTED' as const
        })
      }, 500)
    })
  }

  // 获取演示任务状态
  private static getDemoTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
    // 模拟任务进度
    const progress = Math.min(95, Math.floor(Math.random() * 50) + 30)
    
    if (progress < 95) {
      return Promise.resolve({
        status: 'IN_PROGRESS',
        progress
      })
    }

    // 任务完成，返回模拟结果
    return Promise.resolve({
      status: 'COMPLETED',
      progress: 100,
      result: {
        model_urls: {
          ply: '/api/demo-model.ply',
          glb: '/api/demo-model.glb',
          obj: '/api/demo-model.obj'
        },
        thumbnail_url: '/placeholder.jpg'
      }
    })
  }

  // 轮询任务直到完成
  static async pollTaskCompletion(
    taskId: string, 
    onProgress?: (progress: number) => void,
    maxAttempts = 60,
    intervalMs = 5000
  ): Promise<MeshyTaskStatus> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.getTaskStatus(taskId)
        
        if (onProgress && status.progress !== undefined) {
          onProgress(status.progress)
        }

        if (status.status === 'COMPLETED') {
          return status
        }

        if (status.status === 'FAILED') {
          throw new Error(status.error || '任务失败')
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, intervalMs))
        attempts++
        
      } catch (error) {
        if (attempts === maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs))
        attempts++
      }
    }

    throw new Error('任务超时')
  }

  // 上传图片到Meshy AI
  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${this.BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || '图片上传失败')
    }

    const data = await response.json()
    return data.url
  }

  // 获取账户信息
  static async getAccountInfo() {
    return this.makeRequest('/account')
  }

  // 获取账户余额
  static async getAccountBalance() {
    const accountInfo = await this.getAccountInfo()
    return {
      credits: accountInfo.credits || 0,
      plan: accountInfo.plan || 'free'
    }
  }

  // 根据选项调整API参数
  static mapOptionsToAPI(options: MeshyAIOptions) {
    return {
      style: options.style,
      // Meshy AI的具体参数映射
      // 这里需要根据Meshy AI的实际API参数进行调整
    }
  }
}

// 错误处理类
export class MeshyAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public taskId?: string
  ) {
    super(message)
    this.name = 'MeshyAIError'
  }
}

// 工具函数
export const MeshyUtils = {
  // 估算生成时间（秒）
  estimateGenerationTime(options: MeshyAIOptions): number {
    const baseTime = 30 // 基础时间30秒
    const qualityMultiplier = options.quality / 100
    const complexityMultiplier = options.complexity / 100
    
    return Math.round(baseTime * qualityMultiplier * complexityMultiplier)
  },

  // 格式化文件大小
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // 验证文本提示词
  validateTextPrompt(prompt: string): { valid: boolean; message?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, message: '请输入描述文本' }
    }
    
    if (prompt.length < 10) {
      return { valid: false, message: '描述文本至少需要10个字符' }
    }
    
    if (prompt.length > 500) {
      return { valid: false, message: '描述文本不能超过500个字符' }
    }
    
    return { valid: true }
  },

  // 验证图片文件
  validateImageFile(file: File): { valid: boolean; message?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: '只支持JPG、PNG、WebP格式的图片' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, message: '图片大小不能超过10MB' }
    }
    
    return { valid: true }
  }
}
