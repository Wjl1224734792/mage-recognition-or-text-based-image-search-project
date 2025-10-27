#!/bin/bash
# 服装图像识别与图像搜索服务 - Docker 停止脚本

echo ""
echo "================================================"
echo "🛑 停止服装图像识别与图像搜索服务"
echo "================================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未找到 Docker"
    echo "💡 请先安装 Docker"
    echo ""
    exit 1
fi

# 进入 Milvus 目录
cd "$(dirname "$0")/Milvus"
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误: 未找到 docker-compose.yml 文件"
    echo "💡 请确保在正确的目录中运行此脚本"
    echo ""
    exit 1
fi

echo "📁 当前目录: $(pwd)"
echo ""

# 显示当前运行的服务
echo "🔍 当前运行的服务:"
docker-compose ps
echo ""

# 停止所有服务
echo "🛑 停止所有服务..."
if ! docker-compose down; then
    echo "❌ 停止服务失败"
    echo ""
    echo "💡 尝试强制停止..."
    docker-compose kill
    docker-compose down --remove-orphans
fi

echo "✅ 服务已停止"
echo ""

# 询问是否清理数据
echo "🤔 是否清理数据卷？(这将删除所有数据)"
read -p "输入 y 清理数据，其他键跳过: " choice

if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
    echo "🧹 清理数据卷..."
    docker-compose down -v
    docker volume prune -f
    echo "✅ 数据已清理"
else
    echo "📦 保留数据卷"
fi

echo ""
echo "📋 其他操作:"
echo "  查看日志: docker-compose logs"
echo "  重新启动: 运行 ./start-docker.sh"
echo "  清理镜像: docker image prune -f"
echo ""

echo "按任意键退出..."
read -n 1 -s
