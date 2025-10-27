#!/bin/bash
# 服装图像识别与图像搜索服务 - Docker 重启脚本

echo ""
echo "================================================"
echo "🔄 重启服装图像识别与图像搜索服务"
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

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down

# 清理未使用的镜像
echo "🧹 清理未使用的镜像..."
docker image prune -f &> /dev/null

# 重新构建镜像
echo "🔨 重新构建镜像..."
echo "   - 构建数据库服务镜像..."
if ! docker-compose build database-service; then
    echo "❌ 数据库服务镜像构建失败"
    exit 1
fi

echo "   - 构建嵌入服务镜像..."
if ! docker-compose build embedding-service; then
    echo "❌ 嵌入服务镜像构建失败"
    exit 1
fi

echo "✅ 镜像构建完成"
echo ""

# 启动服务
echo "🚀 启动所有服务..."
if ! docker-compose up -d; then
    echo "❌ 服务启动失败"
    echo ""
    echo "💡 可能的解决方案:"
    echo "   1. 检查端口是否被占用 (3001, 3002, 19530, 9000, 9001)"
    echo "   2. 检查 Docker 资源是否充足"
    echo "   3. 查看详细错误信息: docker-compose logs"
    echo ""
    exit 1
fi

echo "✅ 服务重启成功"
echo ""

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "📊 服务访问地址:"
echo "   - 数据库服务: http://localhost:3001"
echo "   - 嵌入服务:   http://localhost:3002"
echo "   - Milvus:     localhost:19530"
echo "   - MinIO:      http://localhost:9001"
echo ""

# 检查服务健康状态
echo "🏥 检查服务健康状态..."
echo ""

# 检查数据库服务
echo "检查数据库服务..."
if curl -s http://localhost:3001/health &> /dev/null; then
    echo "✅ 数据库服务正常"
else
    echo "⚠️  数据库服务可能未就绪，请稍等片刻"
fi

# 检查嵌入服务
echo "检查嵌入服务..."
if curl -s http://localhost:3002/health &> /dev/null; then
    echo "✅ 嵌入服务正常"
else
    echo "⚠️  嵌入服务可能未就绪，请稍等片刻"
fi

echo ""
echo "🎉 服务重启完成！"
echo ""

echo "按任意键退出..."
read -n 1 -s
