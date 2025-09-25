// 混元3D API集成服务
export interface Hunyuan3DOptions {
  quality: number // 1-100
  complexity: number // 1-100
  style: string
  material: string
}

export interface Hunyuan3DGenerationRequest {
  mode: 'text-to-3d' | 'image-to-3d'
  text_prompt?: string
  image?: string // base64 encoded image
  mesh?: string // base64 encoded mesh for texture synthesis
}

export interface Hunyuan3DGenerationResponse {
  task_id: string
  status: 'SUBMITTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  result?: {
    mesh_url: string
    texture_url?: string
    thumbnail_url: string
    format: string
  }
  error?: string
}

export interface Hunyuan3DTaskStatus {
  task_id: string
  status: 'SUBMITTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number // 0-100
  result?: {
    mesh_url: string
    texture_url?: string
    thumbnail_url: string
    format: string
  }
  error?: string
}

export class Hunyuan3DService {
  private static readonly BASE_URL = process.env.HUNYUAN_3D_BASE_URL || 'http://localhost:8000'
  private static readonly DEMO_MODE = process.env.NODE_ENV === 'development'

  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // 文本生成3D模型（几何生成）
  static async textTo3D(
    textPrompt: string, 
    options: Hunyuan3DOptions = { quality: 75, complexity: 50, style: 'realistic', material: 'default' }
  ): Promise<Hunyuan3DGenerationResponse> {
    // 演示模式
    if (this.DEMO_MODE) {
      return this.createDemoTask('text-to-3d', textPrompt, options)
    }

    const request = {
      mode: 'text-to-3d',
      text_prompt: textPrompt,
      options: options
    }

    const response = await this.makeRequest('/generate/geometry', {
      method: 'POST',
      body: JSON.stringify(request),
    })

    return {
      task_id: response.task_id,
      status: response.status,
      result: response.result
    }
  }

  // 图片生成3D模型（几何生成）
  static async imageTo3D(
    imageBase64: string, 
    options: Hunyuan3DOptions = { quality: 75, complexity: 50, style: 'realistic', material: 'default' }
  ): Promise<Hunyuan3DGenerationResponse> {
    // 演示模式
    if (this.DEMO_MODE) {
      return this.createDemoTask('image-to-3d', '从图片生成', options)
    }

    const request = {
      mode: 'image-to-3d',
      image_base64: imageBase64,
      options: options
    }

    const response = await this.makeRequest('/generate/geometry', {
      method: 'POST',
      body: JSON.stringify(request),
    })

    return {
      task_id: response.task_id,
      status: response.status,
      result: response.result
    }
  }

  // 纹理合成（为现有网格生成纹理）
  static async generateTexture(
    meshBase64: string,
    imageBase64: string,
    options: Hunyuan3DOptions = { quality: 75, complexity: 50, style: 'realistic', material: 'default' }
  ): Promise<Hunyuan3DGenerationResponse> {
    // 演示模式
    if (this.DEMO_MODE) {
      return this.createDemoTask('texture-synthesis', '纹理合成', options)
    }

    const request = {
      mesh_file: meshBase64,
      image_base64: imageBase64,
      options: options
    }

    const response = await this.makeRequest('/generate/texture', {
      method: 'POST',
      body: JSON.stringify(request),
    })

    return {
      task_id: response.task_id,
      status: response.status,
      result: response.result
    }
  }

  // 查询任务状态
  static async getTaskStatus(taskId: string): Promise<Hunyuan3DTaskStatus> {
    // 演示模式
    if (this.DEMO_MODE) {
      return this.getDemoTaskStatus(taskId)
    }

    return this.makeRequest(`/task/${taskId}`)
  }

  // 轮询任务直到完成
  static async pollTaskCompletion(
    taskId: string, 
    onProgress?: (progress: number) => void,
    maxAttempts = 60,
    intervalMs = 3000
  ): Promise<Hunyuan3DTaskStatus> {
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

  // 上传文件到混元3D服务
  static async uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || '文件上传失败')
    }

    const data = await response.json()
    return data.url
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
  private static createDemoTask(mode: string, prompt: string, options: Hunyuan3DOptions): Promise<Hunyuan3DGenerationResponse> {
    const taskId = `hunyuan_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          task_id: taskId,
          status: 'SUBMITTED'
        })
      }, 800)
    })
  }

  // 获取演示任务状态
  private static getDemoTaskStatus(taskId: string): Promise<Hunyuan3DTaskStatus> {
    // 模拟任务进度
    const progress = Math.min(95, Math.floor(Math.random() * 60) + 20)
    
    if (progress < 95) {
      return Promise.resolve({
        task_id: taskId,
        status: 'PROCESSING',
        progress
      })
    }

    // 任务完成，返回模拟结果
    return Promise.resolve({
      task_id: taskId,
      status: 'COMPLETED',
      progress: 100,
      result: {
        mesh_url: '/api/demo-model.glb',
        texture_url: '/api/demo-texture.jpg',
        thumbnail_url: '/placeholder.jpg',
        format: 'glb'
      }
    })
  }

  // 获取账户信息
  static async getAccountInfo() {
    if (this.DEMO_MODE) {
      return {
        credits: 100,
        plan: 'demo',
        usage: {
          geometry_generation: 5,
          texture_synthesis: 3
        }
      }
    }

    return this.makeRequest('/account')
  }

  // 根据选项调整API参数
  static mapOptionsToAPI(options: Hunyuan3DOptions) {
    return {
      quality: Math.round(options.quality / 100 * 10), // 转换为1-10的等级
      style: options.style,
      material: options.material,
      complexity: options.complexity
    }
  }
}

// 错误处理类
export class Hunyuan3DError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public taskId?: string
  ) {
    super(message)
    this.name = 'Hunyuan3DError'
  }
}

// 工具函数
export const Hunyuan3DUtils = {
  // 估算生成时间（秒）
  estimateGenerationTime(options: Hunyuan3DOptions, mode: string): number {
    const baseTime = mode === 'text-to-3d' ? 45 : 30 // 文本生成需要更长时间
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
    
    if (prompt.length < 5) {
      return { valid: false, message: '描述文本至少需要5个字符' }
    }
    
    if (prompt.length > 1000) {
      return { valid: false, message: '描述文本不能超过1000个字符' }
    }
    
    return { valid: true }
  },

  // 验证图片文件
  validateImageFile(file: File): { valid: boolean; message?: string } {
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
}
