"""
混元3D 2.0 服务
基于官方文档实现Hunyuan3D-DiT和Hunyuan3D-Paint模型服务
"""

import os
import io
import base64
import tempfile
import logging
from typing import Optional, Dict, Any, Tuple
from pathlib import Path

import torch
import numpy as np
from PIL import Image
import trimesh
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 检查是否安装了混元3D包
try:
    from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
    from hy3dgen.texgen import Hunyuan3DPaintPipeline
    HUNYUAN_AVAILABLE = True
    logger.info("混元3D包已成功导入")
except ImportError as e:
    logger.warning(f"混元3D包未安装，将使用模拟模式: {e}")
    HUNYUAN_AVAILABLE = False

app = FastAPI(title="混元3D 2.0 服务", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量存储pipeline
geometry_pipeline = None
texture_pipeline = None

class GenerationRequest(BaseModel):
    mode: str  # "text-to-3d" or "image-to-3d"
    text_prompt: Optional[str] = None
    image_base64: Optional[str] = None
    options: Dict[str, Any] = {}

class TextureRequest(BaseModel):
    mesh_file: str  # base64 encoded mesh
    image_base64: str
    options: Dict[str, Any] = {}

class GenerationResponse(BaseModel):
    success: bool
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

def initialize_pipelines():
    """初始化混元3D pipeline"""
    global geometry_pipeline, texture_pipeline
    
    if not HUNYUAN_AVAILABLE:
        logger.info("使用模拟模式")
        return
    
    try:
        logger.info("正在加载混元3D-DiT模型（mini版本）...")
        # 使用更小的mini模型
        geometry_pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
            'tencent/Hunyuan3D-2mini',
            subfolder='hunyuan3d-dit-v2-mini'
        )
        logger.info("混元3D-DiT模型加载完成")
        
        logger.info("正在加载混元3D-Paint模型...")
        texture_pipeline = Hunyuan3DPaintPipeline.from_pretrained(
            'tencent/Hunyuan3D-2',
            subfolder='hunyuan3d-paint-v2-0'
        )
        logger.info("混元3D-Paint模型加载完成")
        
    except Exception as e:
        logger.error(f"模型加载失败: {e}")
        logger.error("将使用模拟模式运行")
        geometry_pipeline = None
        texture_pipeline = None

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化模型"""
    initialize_pipelines()

@app.get("/")
async def root():
    """健康检查"""
    return {
        "message": "混元3D 2.0 服务运行中",
        "hunyuan_available": HUNYUAN_AVAILABLE,
        "geometry_pipeline": geometry_pipeline is not None,
        "texture_pipeline": texture_pipeline is not None
    }

@app.post("/generate/geometry", response_model=GenerationResponse)
async def generate_geometry(request: GenerationRequest):
    """生成3D几何模型"""
    task_id = f"geom_{hash(str(request))}_{int(torch.randint(0, 10000, (1,)).item())}"
    
    try:
        if not HUNYUAN_AVAILABLE or geometry_pipeline is None:
            # 模拟模式
            return GenerationResponse(
                success=True,
                task_id=task_id,
                status="completed",
                result={
                    "mesh_url": "/api/demo-model.glb",
                    "thumbnail_url": "/placeholder.jpg",
                    "format": "glb",
                    "mode": "simulation"
                }
            )
        
        if request.mode == "text-to-3d":
            if not request.text_prompt:
                raise HTTPException(status_code=400, detail="文本描述不能为空")
            
            # 文本生成3D模型
            logger.info(f"开始文本生成3D模型: {request.text_prompt}")
            mesh = geometry_pipeline(text_prompt=request.text_prompt)[0]
            
        elif request.mode == "image-to-3d":
            if not request.image_base64:
                raise HTTPException(status_code=400, detail="图片不能为空")
            
            # 解码图片
            image_data = base64.b64decode(request.image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            logger.info("开始图片生成3D模型")
            mesh = geometry_pipeline(image=image)[0]
            
        else:
            raise HTTPException(status_code=400, detail="不支持的生成模式")
        
        # 保存网格文件
        mesh_path = f"outputs/geometry_{task_id}.glb"
        os.makedirs("outputs", exist_ok=True)
        mesh.export(mesh_path)
        
        # 生成缩略图
        thumbnail_path = f"outputs/thumb_{task_id}.jpg"
        # 这里可以添加生成缩略图的逻辑
        
        return GenerationResponse(
            success=True,
            task_id=task_id,
            status="completed",
            result={
                "mesh_url": f"/files/{mesh_path}",
                "thumbnail_url": f"/files/{thumbnail_path}",
                "format": "glb"
            }
        )
        
    except Exception as e:
        logger.error(f"几何生成失败: {e}")
        return GenerationResponse(
            success=False,
            task_id=task_id,
            status="failed",
            error=str(e)
        )

@app.post("/generate/texture", response_model=GenerationResponse)
async def generate_texture(request: TextureRequest):
    """生成纹理"""
    task_id = f"tex_{hash(str(request))}_{int(torch.randint(0, 10000, (1,)).item())}"
    
    try:
        if not HUNYUAN_AVAILABLE or texture_pipeline is None:
            # 模拟模式
            return GenerationResponse(
                success=True,
                task_id=task_id,
                status="completed",
                result={
                    "mesh_url": "/api/demo-model.glb",
                    "texture_url": "/api/demo-texture.jpg",
                    "thumbnail_url": "/placeholder.jpg",
                    "format": "glb",
                    "mode": "simulation"
                }
            )
        
        # 解码网格文件
        mesh_data = base64.b64decode(request.mesh_file)
        with tempfile.NamedTemporaryFile(suffix=".obj", delete=False) as tmp_mesh:
            tmp_mesh.write(mesh_data)
            mesh_path = tmp_mesh.name
        
        # 解码图片
        image_data = base64.b64decode(request.image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # 加载网格
        mesh = trimesh.load(mesh_path)
        
        logger.info("开始纹理合成")
        textured_mesh = texture_pipeline(mesh, image=image)
        
        # 保存带纹理的网格
        output_path = f"outputs/textured_{task_id}.glb"
        os.makedirs("outputs", exist_ok=True)
        textured_mesh.export(output_path)
        
        # 清理临时文件
        os.unlink(mesh_path)
        
        return GenerationResponse(
            success=True,
            task_id=task_id,
            status="completed",
            result={
                "mesh_url": f"/files/{output_path}",
                "texture_url": f"/files/texture_{task_id}.jpg",
                "thumbnail_url": f"/files/thumb_{task_id}.jpg",
                "format": "glb"
            }
        )
        
    except Exception as e:
        logger.error(f"纹理生成失败: {e}")
        return GenerationResponse(
            success=False,
            task_id=task_id,
            status="failed",
            error=str(e)
        )

@app.get("/models/status")
async def get_models_status():
    """获取模型状态"""
    return {
        "hunyuan_available": HUNYUAN_AVAILABLE,
        "geometry_pipeline": geometry_pipeline is not None,
        "texture_pipeline": texture_pipeline is not None,
        "device": str(torch.cuda.get_device_name(0)) if torch.cuda.is_available() else "CPU"
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": torch.cuda.Event().elapsed_time(torch.cuda.Event()) if torch.cuda.is_available() else 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

