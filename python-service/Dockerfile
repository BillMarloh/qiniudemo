# 混元3D 2.0 Python服务 Docker配置
FROM nvidia/cuda:11.8-devel-ubuntu20.04

# 设置环境变量
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV CUDA_VISIBLE_DEVICES=0

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    git \
    wget \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip3 install --no-cache-dir -r requirements.txt

# 安装PyTorch (CUDA版本)
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 复制应用代码
COPY . .

# 创建输出目录
RUN mkdir -p outputs

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python3", "hunyuan3d_service.py"]

