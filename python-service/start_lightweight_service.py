#!/usr/bin/env python3
"""
启动轻量级3D生成服务
"""
import sys
import os
import subprocess
import logging

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """检查依赖是否安装"""
    try:
        import fastapi
        import uvicorn
        logger.info("✅ FastAPI和Uvicorn已安装")
        return True
    except ImportError as e:
        logger.error(f"❌ 缺少依赖: {e}")
        logger.info("请运行: pip install fastapi uvicorn")
        return False

def install_lightweight_dependencies():
    """安装轻量级3D模型依赖"""
    dependencies = [
        "fastapi",
        "uvicorn[standard]",
        "python-multipart",
        "pillow",
        "numpy",
        "torch",
        "torchvision",
        "diffusers",
        "transformers",
        "accelerate",
        "shap-e",  # 轻量级文本生成3D
    ]
    
    logger.info("📦 安装轻量级3D模型依赖...")
    for dep in dependencies:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            logger.info(f"✅ {dep} 安装成功")
        except subprocess.CalledProcessError as e:
            logger.warning(f"⚠️ {dep} 安装失败: {e}")

def start_service():
    """启动轻量级3D服务"""
    logger.info("🚀 启动轻量级3D生成服务...")
    
    try:
        # 启动服务
        subprocess.run([
            sys.executable, "lightweight_3d_service.py"
        ], cwd=os.path.dirname(__file__))
    except KeyboardInterrupt:
        logger.info("🛑 服务已停止")
    except Exception as e:
        logger.error(f"❌ 启动服务失败: {e}")

if __name__ == "__main__":
    logger.info("🎯 轻量级3D生成服务启动器")
    
    if not check_dependencies():
        logger.info("📦 正在安装依赖...")
        install_lightweight_dependencies()
    
    start_service()
