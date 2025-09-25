#!/bin/bash

# 混元3D Python服务启动脚本

echo "🚀 启动混元3D 2.0 Python服务..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查NVIDIA Docker支持
if ! docker info | grep -q nvidia; then
    echo "⚠️  未检测到NVIDIA Docker支持，将使用CPU模式"
fi

# 创建必要的目录
mkdir -p outputs models

# 构建并启动服务
echo "📦 构建Docker镜像..."
docker-compose build

echo "🎯 启动混元3D服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "✅ 混元3D服务启动成功！"
    echo "🌐 服务地址: http://localhost:8000"
    echo "📊 健康检查: http://localhost:8000/health"
    echo "📚 API文档: http://localhost:8000/docs"
else
    echo "❌ 服务启动失败，请检查日志："
    docker-compose logs
fi

echo ""
echo "🔧 管理命令："
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"

