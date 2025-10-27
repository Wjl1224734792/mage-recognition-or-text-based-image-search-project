@echo off
REM 服装图像识别与图像搜索服务 - Docker 状态检查脚本

echo.
echo ================================================
echo 📊 服装图像识别与图像搜索服务状态
echo ================================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Docker
    echo 💡 请先安装 Docker Desktop
    echo.
    pause
    exit /b 1
)

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

REM 显示容器状态
echo 🐳 容器状态:
docker-compose ps
echo.

REM 显示服务健康状态
echo 🏥 服务健康状态:
echo.

REM 检查数据库服务
echo 检查数据库服务 (http://localhost:3001)...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 数据库服务正常
    curl -s http://localhost:3001/health
) else (
    echo ❌ 数据库服务不可用
)
echo.

REM 检查嵌入服务
echo 检查嵌入服务 (http://localhost:3002)...
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 嵌入服务正常
    curl -s http://localhost:3002/health
) else (
    echo ❌ 嵌入服务不可用
)
echo.

REM 显示资源使用情况
echo 📈 资源使用情况:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo.

REM 显示端口占用情况
echo 🔌 端口占用情况:
netstat -an | findstr ":3001 :3002 :19530 :9000 :9001"
echo.

REM 显示最近日志
echo 📋 最近日志 (最后10行):
docker-compose logs --tail=10
echo.

echo 📊 服务访问地址:
echo    - 数据库服务: http://localhost:3001
echo    - 嵌入服务:   http://localhost:3002
echo    - Milvus:     localhost:19530
echo    - MinIO:      http://localhost:9001
echo.

echo 按任意键退出...
pause >nul
