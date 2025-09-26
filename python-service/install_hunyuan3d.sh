#!/bin/bash
# 混元3D安装脚本 (Linux/Mac)

echo "🚀 开始安装混元3D 2.0..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装，请先安装Python 3.8+"
    exit 1
fi

echo "✅ Python已安装"

# 检查CUDA是否可用
python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())" 2>/dev/null || echo "⚠️ 无法检查CUDA状态，继续安装..."

# 安装基础依赖
echo "📦 安装基础依赖..."
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 安装其他依赖
echo "📦 安装其他依赖..."
pip3 install -r requirements.txt

# 安装混元3D包
echo "📦 安装混元3D包..."
cd hunyuan3d
pip3 install -e .

# 安装纹理生成的自定义组件
echo "📦 安装纹理生成组件..."
cd hy3dgen/texgen/custom_rasterizer
python3 setup.py install
cd ../../..

cd hy3dgen/texgen/differentiable_renderer
python3 setup.py install
cd ../../..

cd ..

echo "✅ 混元3D安装完成！"
echo ""
echo "🔧 下一步："
echo "  1. 运行 ./start.sh 启动服务"
echo "  2. 访问 http://localhost:8000 查看服务状态"
echo "  3. 访问 http://localhost:8000/docs 查看API文档"
