@echo off
echo 🚀 安装轻量级3D生成模型...

echo 📦 安装Shap-E...
pip install shap-e

echo 📦 安装DreamGaussian...
git clone https://github.com/dreamgaussian/dreamgaussian.git
cd dreamgaussian
pip install -r requirements.txt
cd ..

echo 📦 安装Zero-1-to-3...
git clone https://github.com/Stability-AI/zero123.git
cd zero123
pip install -r requirements.txt
cd ..

echo 📦 安装PIFu...
git clone https://github.com/shunsukesaito/PIFu.git
cd PIFu
pip install -r requirements.txt
cd ..

echo ✅ 安装完成！
echo.
echo 🎯 推荐使用顺序：
echo   1. Shap-E (最适合您的GPU)
echo   2. PIFu (人物重建专用)
echo   3. DreamGaussian (高质量)
echo   4. Zero-1-to-3 (图生3D)

pause
