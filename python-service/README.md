# 轻量级3D生成服务

基于轻量级AI模型的3D生成服务，支持文本生成3D和图片生成3D。

## 🚀 支持的模型

### 文本生成3D
- **Shap-E**: OpenAI轻量级模型，2-4GB显存，30秒-2分钟
- **DreamGaussian**: 高质量高斯splatting，3-6GB显存，1-3分钟
- **Instant3D**: 极速生成，3-4GB显存，10-30秒

### 图片生成3D
- **Zero-1-to-3**: 单图多视角生成，4-6GB显存，2-4分钟
- **PIFu**: 人物重建专用，2-4GB显存，1-2分钟

## 📦 安装

### 方法1: 使用安装脚本
```bash
# Windows
install_lightweight.bat

# Linux/Mac
pip install -r requirements.txt
```

### 方法2: 手动安装
```bash
pip install -r requirements.txt
```

## 🎯 启动服务

```bash
python start_lightweight_service.py
```

服务将在 `http://localhost:8001` 启动。

## 🔧 API接口

### 获取服务状态
```
GET /
```

### 文本生成3D
```
POST /generate/text-to-3d
{
  "prompt": "一只可爱的猫咪",
  "model_type": "shap-e",
  "quality": "medium",
  "num_steps": 20
}
```

### 图片生成3D
```
POST /generate/image-to-3d
{
  "image_base64": "base64_encoded_image",
  "model_type": "zero123",
  "quality": "high"
}
```

### 获取模型信息
```
GET /models/info
```

## 🐳 Docker部署

```bash
# 构建镜像
docker build -t lightweight-3d .

# 运行容器
docker run -p 8001:8001 lightweight-3d
```

或使用docker-compose:
```bash
docker-compose up -d
```

## 📝 注意事项

1. 确保有足够的显存（推荐4GB+）
2. 首次运行会自动下载模型文件
3. 生成时间取决于模型复杂度和硬件配置
4. 支持GPU加速（需要CUDA环境）

## 🛠️ 开发

### 添加新模型
1. 在 `lightweight_3d_service.py` 中添加模型加载逻辑
2. 实现对应的生成函数
3. 更新API接口

### 调试
```bash
# 启用详细日志
export LOG_LEVEL=DEBUG
python lightweight_3d_service.py
```