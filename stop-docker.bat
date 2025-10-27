@echo off
REM 服装图像识别与图像搜索服务 - Docker 停止脚本

echo.
echo ================================================
echo 🛑 停止服装图像识别与图像搜索服务
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

REM 显示当前运行的服务
echo 🔍 当前运行的服务:
docker-compose ps
echo.

REM 停止所有服务
echo 🛑 停止所有服务...
docker-compose down

if %errorlevel% neq 0 (
    echo ❌ 停止服务失败
    echo.
    echo 💡 尝试强制停止...
    docker-compose kill
    docker-compose down --remove-orphans
)

echo ✅ 服务已停止
echo.

REM 询问是否清理数据
echo 🤔 是否清理数据卷？(这将删除所有数据)
set /p choice="输入 y 清理数据，其他键跳过: "

if /i "%choice%"=="y" (
    echo 🧹 清理数据卷...
    docker-compose down -v
    docker volume prune -f
    echo ✅ 数据已清理
) else (
    echo 📦 保留数据卷
)

echo.
echo 📋 其他操作:
echo   查看日志: docker-compose logs
echo   重新启动: 运行 start-docker.bat
echo   清理镜像: docker image prune -f
echo.

echo 按任意键退出...
pause >nul
