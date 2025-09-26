@echo off
REM 混元3D安装脚本 (Windows)

echo 🚀 开始安装混元3D 2.0...

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装，请先安装Python 3.8+
    pause
    exit /b 1
)

echo ✅ Python已安装

REM 检查CUDA是否可用
python -c "import torch; print('CUDA available:', torch.cuda.is_available())" 2>nul
if errorlevel 1 (
    echo ⚠️ 无法检查CUDA状态，继续安装...
) else (
    echo ✅ CUDA检查完成
)

REM 安装基础依赖
echo 📦 安装基础依赖...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

REM 安装其他依赖
echo 📦 安装其他依赖...
pip install -r requirements.txt

REM 安装混元3D包
echo 📦 安装混元3D包...
cd hunyuan3d
pip install -e .

REM 安装纹理生成的自定义组件
echo 📦 安装纹理生成组件...
cd hy3dgen/texgen/custom_rasterizer
python setup.py install
cd ../../..

cd hy3dgen/texgen/differentiable_renderer
python setup.py install
cd ../../..

cd ..

echo ✅ 混元3D安装完成！
echo.
echo 🔧 下一步：
echo   1. 运行 start.bat 启动服务
echo   2. 访问 http://localhost:8000 查看服务状态
echo   3. 访问 http://localhost:8000/docs 查看API文档

pause
