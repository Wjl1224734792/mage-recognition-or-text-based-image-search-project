@echo off
REM 服装图像识别与图像搜索服务 - Docker 启动脚本
REM 自动构建镜像并启动所有容器

echo.
echo ================================================
echo 🐳 服装图像识别与图像搜索服务
echo ================================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Docker
    echo 💡 请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo ✅ Docker 已安装
echo.

REM 检查 Docker 是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: Docker 未运行
    echo 💡 请启动 Docker Desktop
    echo.
    pause
    exit /b 1
)

echo ✅ Docker 正在运行
echo.

REM 进入 Milvus 目录
cd /d "%~dp0Milvus"
if not exist "docker-compose.yml" (
    echo ❌ 错误: 未找到 docker-compose.yml 文件
    echo 💡 请确保在正确的目录中运行此脚本
    echo.
    pause
    exit /b 1
)

echo 📁 当前目录: %CD%
echo.

REM 停止现有容器（如果存在）
echo 🛑 停止现有容器...
docker-compose down >nul 2>&1

REM 清理未使用的镜像（可选）
echo 🧹 清理未使用的镜像...
docker image prune -f >nul 2>&1

REM 构建镜像
echo 🔨 构建镜像...
echo    - 构建数据库服务镜像...
docker-compose build database-service
if %errorlevel% neq 0 (
    echo ❌ 数据库服务镜像构建失败
    pause
    exit /b 1
)

echo    - 构建嵌入服务镜像...
docker-compose build embedding-service
if %errorlevel% neq 0 (
    echo ❌ 嵌入服务镜像构建失败
    pause
    exit /b 1
)

echo ✅ 镜像构建完成
echo.

REM 启动服务
echo 🚀 启动所有服务...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ 服务启动失败
    echo.
    echo 💡 可能的解决方案:
    echo    1. 检查端口是否被占用 (3001, 3002, 19530, 9000, 9001)
    echo    2. 检查 Docker 资源是否充足
    echo    3. 查看详细错误信息: docker-compose logs
    echo.
    pause
    exit /b 1
)

echo ✅ 服务启动成功
echo.

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
echo 🔍 检查服务状态...
docker-compose ps

echo.
echo 📊 服务访问地址:
echo    - 数据库服务: http://localhost:3001
echo    - 嵌入服务:   http://localhost:3002
echo    - Milvus:     localhost:19530
echo    - MinIO:      http://localhost:9001
echo.

REM 检查服务健康状态
echo 🏥 检查服务健康状态...
echo.

REM 检查数据库服务
echo 检查数据库服务...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 数据库服务正常
) else (
    echo ⚠️  数据库服务可能未就绪，请稍等片刻
)

REM 检查嵌入服务
echo 检查嵌入服务...
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 嵌入服务正常
) else (
    echo ⚠️  嵌入服务可能未就绪，请稍等片刻
)

echo.
echo 🎉 所有服务已启动！
echo.
echo 📋 常用命令:
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   重启服务: docker-compose restart
echo   查看状态: docker-compose ps
echo.

echo 按任意键退出...
pause >nul
