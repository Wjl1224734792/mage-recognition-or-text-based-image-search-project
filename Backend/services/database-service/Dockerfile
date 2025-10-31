# 数据库服务 Dockerfile
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
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 已包含 node_modules，无需在镜像内安装依赖

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p /app/config /app/utils /app/models /app/.cache

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# 启动命令
CMD ["node", "services/database-service/index.js"]
