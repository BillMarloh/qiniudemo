#!/usr/bin/env python3
"""
混元3D集成测试脚本
"""

import sys
import os
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_imports():
    """测试混元3D包导入"""
    logger.info("🔍 测试混元3D包导入...")
    
    try:
        import torch
        logger.info(f"✅ PyTorch版本: {torch.__version__}")
        logger.info(f"✅ CUDA可用: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            logger.info(f"✅ GPU设备: {torch.cuda.get_device_name(0)}")
    except ImportError as e:
        logger.error(f"❌ PyTorch导入失败: {e}")
        return False
    
    try:
        from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
        logger.info("✅ 混元3D-DiT管道导入成功")
    except ImportError as e:
        logger.error(f"❌ 混元3D-DiT管道导入失败: {e}")
        return False
    
    try:
        from hy3dgen.texgen import Hunyuan3DPaintPipeline
        logger.info("✅ 混元3D-Paint管道导入成功")
    except ImportError as e:
        logger.error(f"❌ 混元3D-Paint管道导入失败: {e}")
        return False
    
    return True

def test_model_loading():
    """测试模型加载"""
    logger.info("🔍 测试模型加载...")
    
    try:
        from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
        
        # 尝试加载模型（这会下载模型文件）
        logger.info("正在加载混元3D-DiT模型...")
        pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
            'tencent/Hunyuan3D-2',
            subfolder='hunyuan3d-dit-v2-0'
        )
        logger.info("✅ 混元3D-DiT模型加载成功")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 模型加载失败: {e}")
        return False

def test_simple_generation():
    """测试简单生成"""
    logger.info("🔍 测试简单生成...")
    
    try:
        from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
        
        # 创建pipeline
        pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
            'tencent/Hunyuan3D-2',
            subfolder='hunyuan3d-dit-v2-0'
        )
        
        # 测试文本生成3D
        logger.info("正在测试文本生成3D...")
        mesh = pipeline(text_prompt="一只可爱的小猫")[0]
        
        logger.info("✅ 文本生成3D测试成功")
        logger.info(f"✅ 生成网格顶点数: {len(mesh.vertices)}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 生成测试失败: {e}")
        return False

def main():
    """主测试函数"""
    logger.info("🚀 开始混元3D集成测试...")
    
    # 测试导入
    if not test_imports():
        logger.error("❌ 导入测试失败，请检查安装")
        sys.exit(1)
    
    # 测试模型加载
    if not test_model_loading():
        logger.error("❌ 模型加载测试失败")
        sys.exit(1)
    
    # 测试简单生成
    if not test_simple_generation():
        logger.error("❌ 生成测试失败")
        sys.exit(1)
    
    logger.info("🎉 所有测试通过！混元3D集成成功！")

if __name__ == "__main__":
    main()
