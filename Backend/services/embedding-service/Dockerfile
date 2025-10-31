# 嵌入服务 Dockerfile
FROM node:22.21.1-trixie-slim

# 设置工作目录
WORKDIR /app

# 使用国内镜像源（Debian Trixie 清华镜像 + npm npmmirror）
RUN printf "deb http://mirrors.tuna.tsinghua.edu.cn/debian/ trixie main contrib non-free non-free-firmware\n" \
  > /etc/apt/sources.list \
  && printf "deb http://mirrors.tuna.tsinghua.edu.cn/debian/ trixie-updates main contrib non-free non-free-firmware\n" \
  >> /etc/apt/sources.list \
  && printf "deb http://mirrors.tuna.tsinghua.edu.cn/debian/ trixie-backports main contrib non-free non-free-firmware\n" \
  >> /etc/apt/sources.list \
  && printf "deb http://mirrors.tuna.tsinghua.edu.cn/debian-security trixie-security main contrib non-free non-free-firmware\n" \
  >> /etc/apt/sources.list \
  && npm config set registry https://mirrors.huaweicloud.com/repository/npm/

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*  # 清理缓存，减小镜像体积

# 安装/更新 yarn（如果不存在或需要更新）- 使用 --force 避免冲突
RUN npm install -g yarn --force || true

# 复制所有文件到容器（包括 Windows 版本的 node_modules）
COPY . .

# 强制重新安装 sharp，确保使用 Linux 版本（覆盖 Windows 版本）
# 删除 Windows 版本的 sharp，然后使用 yarn 单独安装 Linux 版本
# 在容器内，会自动安装匹配当前 Linux 平台的版本
RUN echo "🗑️ 删除 Windows 版本的 sharp..." && \
    rm -rf node_modules/sharp services/embedding-service/node_modules/sharp && \
    cd services/embedding-service && \
    echo "📦 使用 yarn 单独安装 Linux 版本的 sharp..." && \
    (yarn add sharp --force || \
     (echo "⚠️ yarn 安装失败，尝试使用 npm..." && npm install sharp --force) || \
     (echo "⚠️ npm 单独安装失败，回退到重新安装所有依赖..." && yarn install --force || npm install --force)) && \
    echo "✅ sharp 安装完成"

# 创建必要的目录
RUN mkdir -p /app/config /app/utils /app/models /app/.cache

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3002

# 暴露端口
EXPOSE 3002

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# 启动命令
CMD ["node", "services/embedding-service/index.js"]
