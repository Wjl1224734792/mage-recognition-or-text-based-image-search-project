# 嵌入服务 Dockerfile
FROM node:lts

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile --production

# 复制应用代码
COPY . .

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
