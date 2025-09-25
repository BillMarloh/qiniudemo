@echo off
REM 混元3D Python服务启动脚本 (Windows)

echo 🚀 启动混元3D 2.0 Python服务...

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未安装，请先安装Docker Desktop
    pause
    exit /b 1
)

REM 检查Docker Compose是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose未安装，请先安装Docker Compose
    pause
    exit /b 1
)

REM 创建必要的目录
if not exist "outputs" mkdir outputs
if not exist "models" mkdir models

REM 构建并启动服务
echo 📦 构建Docker镜像...
docker-compose build

echo 🎯 启动混元3D服务...
docker-compose up -d

echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 服务启动失败，请检查日志：
    docker-compose logs
) else (
    echo ✅ 混元3D服务启动成功！
    echo 🌐 服务地址: http://localhost:8000
    echo 📊 健康检查: http://localhost:8000/health
    echo 📚 API文档: http://localhost:8000/docs
)

echo.
echo 🔧 管理命令：
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   重启服务: docker-compose restart

pause

