import { create } from 'zustand'

export interface ModelData {
  id: string
  name: string
  description: string
  modelUrl: string
  thumbnailUrl: string
  createdAt: Date
  updatedAt: Date
  userId: string
  tags: string[]
  format: string
  size: number
  provider?: string
}

export interface GenerationOptions {
  quality: number
  complexity: number
  style: string
  material: string
  model_type?: string
}

interface ModelStore {
  // 模型数据
  modelData: ModelData | null
  userModels: ModelData[]
  
  // 生成状态
  isLoading: boolean
  error: string | null
  progress: number
  
  // 生成选项
  generationOptions: GenerationOptions
  
  // Actions
  setModelData: (data: ModelData | null) => void
  setUserModels: (models: ModelData[]) => void
  addModel: (model: ModelData) => void
  updateModel: (id: string, updates: Partial<ModelData>) => void
  deleteModel: (id: string) => void
  
  // 生成相关
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setProgress: (progress: number) => void
  
  // 选项相关
  setGenerationOptions: (options: Partial<GenerationOptions>) => void
}

export const useModelStore = create<ModelStore>((set, get) => ({
  // 初始状态
  modelData: null,
  userModels: [],
  isLoading: false,
  error: null,
  progress: 0,
  generationOptions: {
    quality: 75,
    complexity: 50,
    style: 'realistic',
    material: 'default'
  },

  // Actions
  setModelData: (data) => set({ modelData: data }),
  
  setUserModels: (models) => set({ userModels: models }),
  
  addModel: (model) => set((state) => ({
    userModels: [...state.userModels, model]
  })),
  
  updateModel: (id, updates) => set((state) => ({
    userModels: state.userModels.map(model =>
      model.id === id ? { ...model, ...updates } : model
    ),
    modelData: state.modelData?.id === id ? { ...state.modelData, ...updates } : state.modelData
  })),
  
  deleteModel: (id) => set((state) => ({
    userModels: state.userModels.filter(model => model.id !== id),
    modelData: state.modelData?.id === id ? null : state.modelData
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setProgress: (progress) => set({ progress }),

  setGenerationOptions: (options) => set((state) => ({
    generationOptions: { ...state.generationOptions, ...options }
  }))
}))
