# 混元3D 2.0 Python服务

基于官方文档实现的混元3D-DiT和混元3D-Paint模型服务。

## 🚀 快速开始

### 1. 环境要求

- **Python**: 3.8+
- **CUDA**: 11.8+ (推荐GPU加速)
- **Docker**: 20.10+ (推荐)
- **Docker Compose**: 2.0+

### 2. 安装混元3D包

根据官方文档，需要先安装混元3D包：

```bash
# 方式一：使用安装脚本 (推荐)
# Windows
install_hunyuan3d.bat

# Linux/Mac
chmod +x install_hunyuan3d.sh
./install_hunyuan3d.sh

# 方式二：手动安装
# 安装PyTorch (请根据您的CUDA版本选择)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 安装基础依赖
pip install -r requirements.txt

# 安装混元3D包
cd hunyuan3d
pip install -e .

# 安装纹理生成组件
cd hy3dgen/texgen/custom_rasterizer
python setup.py install
cd ../../..

cd hy3dgen/texgen/differentiable_renderer
python setup.py install
cd ../../..
```

**注意**: 混元3D包已通过GitHub开源版本集成，无需申请访问权限。

### 3. 启动服务

#### 方式一：Docker (推荐)

```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

#### 方式二：直接运行

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python hunyuan3d_service.py
```

### 4. 验证安装

#### 测试混元3D集成
```bash
# 运行测试脚本
python test_hunyuan3d.py
```

#### 启动服务
```bash
# 启动服务
python hunyuan3d_service.py
```

访问 http://localhost:8000 查看服务状态

## 📚 API文档

服务启动后，访问 http://localhost:8000/docs 查看完整的API文档。

### 主要端点

#### 生成3D几何模型
```
POST /generate/geometry
{
  "mode": "text-to-3d" | "image-to-3d",
  "text_prompt": "一只可爱的猫咪",
  "image_base64": "base64_encoded_image",
  "options": {
    "quality": 75,
    "complexity": 50,
    "style": "realistic",
    "material": "default"
  }
}
```

#### 生成纹理
```
POST /generate/texture
{
  "mesh_file": "base64_encoded_mesh",
  "image_base64": "base64_encoded_image",
  "options": {
    "quality": 75,
    "complexity": 50,
    "style": "realistic",
    "material": "default"
  }
}
```

#### 健康检查
```
GET /health
```

## 🔧 配置说明

### 环境变量

- `CUDA_VISIBLE_DEVICES`: 指定使用的GPU设备
- `PYTHONPATH`: Python路径设置

### 模型文件

模型文件将自动下载到以下位置：
- 几何生成模型: `~/.cache/huggingface/hub/models--tencent--Hunyuan3D-2/`
- 纹理合成模型: `~/.cache/huggingface/hub/models--tencent--Hunyuan3D-2/`

## 🐛 故障排除

### 常见问题

1. **模型加载失败**
   - 检查网络连接
   - 确认磁盘空间充足
   - 验证CUDA环境

2. **内存不足**
   - 减少batch size
   - 使用CPU模式
   - 增加系统内存

3. **Docker启动失败**
   - 检查Docker Desktop是否运行
   - 确认NVIDIA Docker支持
   - 查看Docker日志

### 日志查看

```bash
# Docker日志
docker-compose logs -f

# 服务日志
tail -f outputs/service.log
```

## 📊 性能优化

### GPU加速

确保安装了正确的CUDA版本：

```bash
# 检查CUDA版本
nvidia-smi

# 安装对应版本的PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 内存优化

- 使用较小的模型精度
- 启用梯度检查点
- 调整batch size

## 🔒 安全注意事项

- 服务仅在内网环境运行
- 定期更新依赖包
- 监控资源使用情况
- 备份重要数据

## 📞 支持

如有问题，请参考：
- [混元3D官方文档](https://github.com/tencent/Hunyuan3D)
- [PyTorch文档](https://pytorch.org/docs/)
- [FastAPI文档](https://fastapi.tiangolo.com/)

