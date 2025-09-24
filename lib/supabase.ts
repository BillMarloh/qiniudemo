import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 客户端Supabase实例（用于前端）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端Supabase实例（用于API路由）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 数据库表类型定义
export interface ModelRecord {
  id: string
  name: string
  description: string
  model_url: string
  thumbnail_url: string
  user_id: string
  tags: string[]
  format: string
  file_size: number
  generation_options: any
  created_at: string
  updated_at: string
}

export interface UserRecord {
  id: string
  email: string
  name: string
  avatar_url?: string
  subscription_plan: 'free' | 'pro' | 'enterprise'
  credits_remaining: number
  created_at: string
  updated_at: string
}

// Supabase数据库操作类
export class SupabaseService {
  // 模型相关操作
  static async createModel(modelData: Omit<ModelRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('models')
      .insert([modelData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getModelsByUserId(userId: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  static async getModelById(id: string) {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async updateModel(id: string, updates: Partial<ModelRecord>) {
    const { data, error } = await supabaseAdmin
      .from('models')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteModel(id: string) {
    const { error } = await supabaseAdmin
      .from('models')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  // 用户相关操作
  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async updateUserCredits(userId: string, creditsUsed: number) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        credits_remaining: supabaseAdmin.rpc('decrement_credits', { 
          user_id: userId, 
          credits: creditsUsed 
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // 文件上传操作
  static async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (error) throw error
    return data
  }

  static async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }

  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return true
  }
}
