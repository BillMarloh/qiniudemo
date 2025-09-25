# 3D模型生成应用设置指南

## 🚀 快速开始

### 1. 环境变量配置

复制 `env.example` 为 `.env.local` 并填入真实值：

```bash
cp env.example .env.local
```

必需的环境变量：
```env
# Supabase数据库配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥

# 混元3D Python服务配置（推荐）
HUNYUAN_3D_BASE_URL=http://localhost:8000

# Meshy AI 3D模型生成API（备用）
MESHY_API_KEY=你的Meshy API密钥
```

### 2. Supabase数据库设置

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 在SQL编辑器中运行 `supabase-init.sql` 脚本
4. 获取项目URL和API密钥：
   - 项目URL: Settings → API → Project URL
   - 匿名密钥: Settings → API → anon public
   - 服务角色密钥: Settings → API → service_role secret

### 3. 混元3D Python服务设置

1. 进入 `python-service` 目录
2. 按照 `python-service/README.md` 安装混元3D包
3. 启动Python服务：
   ```bash
   # Windows
   python-service/start.bat
   
   # Linux/Mac
   python-service/start.sh
   ```
4. 确保服务运行在 http://localhost:8000

### 4. Meshy AI API设置（可选）

1. 访问 [Meshy AI](https://www.meshy.ai/)
2. 注册账户并获取API密钥
3. 将API密钥添加到 `.env.local` 文件中

### 5. 安装依赖并运行

```bash
npm install
npm run dev
```

访问 http://localhost:3000 开始使用！

## 📋 功能特性

- ✅ 文本描述生成3D模型（混元3D-DiT）
- ✅ 图片上传生成3D模型（混元3D-DiT）
- ✅ 3D模型纹理合成（混元3D-Paint）
- ✅ 实时3D模型预览
- ✅ 模型参数调节（质量、风格、材质等）
- ✅ 模型导出（GLB、OBJ、STL等格式）
- ✅ 用户模型库管理
- ✅ Supabase数据库存储
- ✅ 混元3D API集成
- ✅ Meshy AI集成（备用）

## 🔧 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **3D渲染**: Three.js + React Three Fiber
- **UI组件**: shadcn/ui + Radix UI
- **状态管理**: Zustand
- **数据库**: Supabase (PostgreSQL)
- **3D生成**: 混元3D Python服务 (Hunyuan3D-DiT + Hunyuan3D-Paint)
- **备用3D生成**: Meshy AI API
- **文件存储**: Supabase Storage

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── generate-model/ # 模型生成API
│   │   └── models/        # 模型管理API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── ui/               # UI基础组件
│   ├── generation-workspace.tsx # 生成工作台
│   ├── three-model-preview.tsx  # 3D预览器
│   └── ...
├── lib/                  # 工具库
│   ├── supabase.ts       # Supabase配置
│   ├── hunyuan-3d.ts     # 混元3D服务集成
│   ├── meshy-ai.ts       # Meshy AI集成（备用）
│   └── store.ts          # Zustand状态管理
├── python-service/       # 混元3D Python服务
│   ├── hunyuan3d_service.py # 主服务文件
│   ├── requirements.txt  # Python依赖
│   ├── Dockerfile        # Docker配置
│   └── start.bat/start.sh # 启动脚本
├── hooks/                # 自定义Hooks
└── public/               # 静态资源
```

## 🎯 API端点

### 生成模型（混元3D）
```
POST /api/generate-model
- textPrompt: 文本描述
- imageFile: 图片文件
- options: 生成选项
```

### 纹理合成（混元3D）
```
POST /api/generate-texture
- meshFile: 网格文件
- imageFile: 参考图片
- options: 合成选项
```

### 模型管理
```
GET /api/models?userId=xxx     # 获取用户模型列表
POST /api/models               # 创建模型
GET /api/models/[id]           # 获取模型详情
PUT /api/models/[id]           # 更新模型
DELETE /api/models/[id]        # 删除模型
```

## 🔍 故障排除

### 常见问题

1. **Supabase连接失败**
   - 检查URL和密钥是否正确
   - 确认数据库表已创建

2. **Meshy AI API错误**
   - 验证API密钥是否有效
   - 检查账户余额

3. **3D模型加载失败**
   - 确认模型URL可访问
   - 检查浏览器控制台错误

### 调试模式

在开发环境中，可以查看详细日志：
```bash
DEBUG=* npm run dev
```

## 📞 支持

如有问题，请检查：
1. 环境变量配置
2. 数据库连接
3. API密钥有效性
4. 浏览器控制台错误

---

🎉 现在您可以开始使用3D模型生成应用了！
