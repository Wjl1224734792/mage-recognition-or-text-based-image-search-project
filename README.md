# 服装图像识别与图像搜索服务

基于 Milvus 向量数据库的服装图像识别与搜索服务，提供图像特征提取、向量存储和相似性搜索功能。

## 🏗️ 架构设计

### 服务架构
```
服装图像识别与图像搜索服务/
├── Backend/                   # 后端服务
│   ├── config/                # 共享配置
│   │   └── shared.config.js   # 统一配置管理
│   ├── services/              # 微服务目录
│   │   ├── database-service/  # 数据库服务
│   │   │   ├── services/      # 业务逻辑
│   │   │   ├── handlers/      # 请求处理
│   │   │   ├── routes/        # 路由定义
│   │   │   ├── test/          # 测试文件
│   │   │   └── package.json   # 服务依赖
│   │   └── embedding-service/ # 嵌入服务
│   │       ├── services/      # 业务逻辑
│   │       ├── handlers/      # 请求处理
│   │       ├── routes/        # 路由定义
│   │       ├── test/          # 测试文件
│   │       └── package.json   # 服务依赖
│   ├── utils/                 # 共享工具
│   │   ├── http.util.js      # HTTP 请求工具
│   │   └── concurrency.util.js # 并发控制工具
│   └── package.json          # 根配置
├── Milvus/                    # Milvus 配置
│   └── docker-compose.yml     # Docker 配置
└── .gitignore                 # Git 忽略文件
```

### 服务通信
- **数据库服务** → **嵌入服务**: 通过 HTTP API 调用图像特征提取
- **并发控制**: 两个服务都使用独立的并发控制器
- **配置管理**: 统一的配置文件管理所有服务参数

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

#### 1. 启动所有服务
```bash
# 进入 Milvus 目录
cd Milvus

# 启动所有服务（包括 Milvus、MinIO、数据库服务和嵌入服务）
docker-compose up -d
```

#### 2. 查看服务状态
```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

### 方式二：本地开发部署

#### 1. 启动 Milvus 服务
```bash
# 进入 Milvus 目录
cd Milvus

# 启动 Milvus 服务
docker-compose up -d etcd minio standalone
```

#### 2. 安装依赖
```bash
# 进入 Backend 目录
cd Backend

# 安装所有服务依赖
yarn install:all
```

#### 3. 启动服务

##### 启动单个服务
```bash
# 启动嵌入服务
yarn start:embedding

# 启动数据库服务
yarn start:database
```

##### 启动所有服务
```bash
# 同时启动两个服务
yarn start:all
```

#### 4. 开发模式
```bash
# 开发模式启动所有服务
yarn dev:all
```

## 📡 API 接口

### 嵌入服务 (端口: 3002)

#### 提取图像特征
```http
POST http://localhost:3002/api/v1/embedding/extract
Content-Type: application/json

{
  "imageInput": "https://example.com/image.jpg"
}
```

#### 批量提取特征
```http
POST http://localhost:3002/api/v1/embedding/batch-extract
Content-Type: application/json

{
  "imageInputs": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

#### 获取服务状态
```http
GET http://localhost:3002/api/v1/embedding/status
```

#### 获取可用模型
```http
GET http://localhost:3002/api/v1/embedding/models
```

### 数据库服务 (端口: 3001/8880)

#### 插入图像向量
```http
POST http://localhost:3001/api/v1/milvus/insert
Content-Type: application/json

{
  "rowId": "unique-id-123",
  "imageInput": "https://example.com/image.jpg"
}
```

#### 更新图像向量
```http
POST http://localhost:3001/api/v1/milvus/update
Content-Type: application/json

{
  "rowId": "unique-id-123",
  "imageInput": "https://example.com/image.jpg"
}
```

#### 同步图像向量
```http
POST http://localhost:3001/api/v1/milvus/sync
Content-Type: application/json

{
  "rowId": "unique-id-123",
  "imageInput": "https://example.com/image.jpg"
}
```

#### 搜索相似向量（通过URL）
```http
POST http://localhost:3001/api/v1/milvus/search
Content-Type: application/json

{
  "imageInput": "https://example.com/image.jpg",
  "limit": 20
}
```

#### 搜索相似向量（通过文件上传）
```http
POST http://localhost:3001/api/v1/milvus/search/blob?limit=20
Content-Type: multipart/form-data

# 表单数据：
# image: [图像文件]
```

#### 批量删除向量
```http
POST http://localhost:3001/api/v1/milvus/batch-delete
Content-Type: application/json

{
  "rowIds": ["unique-id-123", "unique-id-456"]
}
```

#### 获取集合统计
```http
GET http://localhost:3001/api/v1/milvus/stats
```

> **💡 端口配置说明**: 数据库服务支持自定义对外端口，可通过修改 `docker-compose.yml` 中的端口映射来更改对外访问端口。例如：`"8880:3001"` 表示外部通过 8880 端口访问，容器内部仍使用 3001 端口。

> **📸 图像输入支持**: 
> - **URL 搜索**: 使用 `/search` 接口，通过 JSON 传递图像 URL
> - **文件上传搜索**: 使用 `/search/blob` 接口，通过 multipart/form-data 上传图像文件
> - **文件限制**: 支持最大 10MB 的图像文件，支持常见图像格式（jpg、png、gif 等）

## ⚙️ 配置说明

### 配置管理
项目使用统一的配置管理系统，支持环境变量覆盖：

- **默认配置**: `Backend/config/shared.config.js`
- **Docker 环境**: `Backend/docker.env`
- **环境变量**: 支持通过环境变量覆盖所有配置

### 并发控制配置
```javascript
// config/shared.config.js
export const CONCURRENCY_CONFIG = {
  DATABASE_MAX_CONCURRENCY: 10,    // 数据库操作并发数
  EMBEDDING_MAX_CONCURRENCY: 5,    // 嵌入请求并发数
  DEFAULT_RETRIES: 3,               // 默认重试次数
  DEFAULT_RETRY_DELAY: 1000,        // 重试延迟(ms)
  DEFAULT_TIMEOUT: 30000           // 默认超时时间(ms)
};
```

### HTTP 请求配置
```javascript
export const HTTP_CONFIG = {
  EMBEDDING_SERVICE_URL: 'http://localhost:3002',  // 本地开发
  // Docker 环境: 'http://embedding-service:3002'
  DATABASE_SERVICE_PORT: 3001,
  EMBEDDING_SERVICE_PORT: 3002,
  REQUEST_TIMEOUT: 30000,
  REQUEST_RETRIES: 3,
  REQUEST_RETRY_DELAY: 1000
};
```

### Milvus 配置
```javascript
export const MILVUS_CONFIG = {
  HOST: 'localhost',              // 本地开发
  // Docker 环境: 'standalone'
  PORT: 19530,
  USERNAME: 'root',               // 认证用户名
  PASSWORD: 'Milvus',             // 认证密码
  COLLECTION_NAME: 'image_vectors',
  VECTOR_DIMENSION: 768,
  SEARCH_LIMIT: 20,
  INDEX_TYPE: 'HNSW'
};
```

### 环境变量配置
Docker 环境通过 `Backend/docker.env` 文件管理：

```bash
# 服务配置
DATABASE_SERVICE_PORT=8880  # 可自定义对外端口
EMBEDDING_SERVICE_PORT=3002

# Milvus 配置
MILVUS_HOST=standalone
MILVUS_PORT=19530
MILVUS_USERNAME=root
MILVUS_PASSWORD=Milvus
MILVUS_COLLECTION_NAME=image_vectors

# 嵌入服务配置
EMBEDDING_SERVICE_URL=http://embedding-service:3002
EMBEDDING_DEFAULT_MODEL=Marqo/marqo-fashionSigLIP
```

### Milvus 认证配置
项目支持通过环境变量配置 Milvus 的认证信息：

```bash
# 设置 Milvus 认证信息
export MILVUS_USERNAME=your_username
export MILVUS_PASSWORD=your_password

# 或在 docker.env 中配置
MILVUS_USERNAME=your_username
MILVUS_PASSWORD=your_password
```

**配置说明：**
- `MILVUS_USERNAME`: Milvus 用户名，默认为 `root`
- `MILVUS_PASSWORD`: Milvus 密码，默认为 `Milvus`
- 支持通过环境变量覆盖默认配置
- Docker 环境建议在 `docker.env` 文件中统一管理

### 端口配置说明

#### 自定义对外端口
数据库服务支持自定义对外端口，有两种配置方式：

**方式一：修改 docker-compose.yml 端口映射**
```yaml
# Milvus/docker-compose.yml
database-service:
  ports:
    - "8880:3001"  # 外部端口:内部端口
```

**方式二：修改环境变量配置**
```bash
# Backend/docker.env
DATABASE_SERVICE_PORT=8880
```

**配置示例：**
- 外部访问：`http://localhost:8880`
- 容器内部：服务监听 3001 端口
- 端口映射：`"8880:3001"` 表示外部 8880 端口映射到容器内部 3001 端口

> **⚠️ 注意事项**: 修改端口后需要重新启动 Docker 服务才能生效。

## 🧪 测试

### 测试覆盖
- ✅ 基础功能测试
- ✅ 并发控制测试
- ✅ 错误处理测试
- ✅ 服务间通信测试

## 🔧 开发工具

### 可用脚本
```bash
# 服务管理
yarn start:all          # 启动所有服务
yarn dev:all            # 开发模式启动所有服务
yarn start:database     # 启动数据库服务
yarn start:embedding    # 启动嵌入服务

# 依赖管理
yarn install:all        # 安装所有依赖
yarn clean              # 清理依赖
yarn fresh-install      # 重新安装所有依赖
```

## 📊 监控和统计

### 服务状态检查
```bash
# 检查嵌入服务状态
curl http://localhost:3002/health

# 检查数据库服务状态（默认端口）
curl http://localhost:3001/health

# 检查数据库服务状态（自定义端口，如8880）
curl http://localhost:8880/health
```

### 并发统计
每个服务都提供实时的并发执行统计信息，包括：
- 总任务数
- 运行中任务数
- 已完成任务数
- 失败任务数
- 成功率
- 平均执行时间

## 🛠️ 技术栈

### 核心依赖
- **Node.js** - 运行时环境
- **Express.js** - Web 框架
- **Milvus** - 向量数据库
- **Hugging Face Transformers** - 图像特征提取

### 工具库
- **HTTP 请求工具** - 基于 fetch 的请求封装
- **并发控制工具** - 任务队列和并发限制
- **配置管理** - 统一配置管理

## 📝 开发规范

### 代码规范
- 使用 ES6+ 模块语法
- 统一的错误处理机制
- 完整的 JSDoc 注释
- 遵循 RESTful API 设计

### 服务通信
- 使用 HTTP API 进行服务间通信
- 统一的请求/响应格式
- 完善的错误处理和重试机制

### 并发控制
- 每个服务独立的并发控制器
- 可配置的并发数量限制
- 任务优先级和超时控制

## 🚨 注意事项

### Docker 部署注意事项
1. **依赖管理**: 所有依赖已统一管理在根目录 `package.json` 中
2. **环境变量**: 使用 `Backend/docker.env` 文件管理配置
3. **容器通信**: 服务间通信使用容器名（如 `standalone`、`embedding-service`）
4. **模型文件**: 确保模型文件存在于 `Backend/models/` 目录
5. **数据持久化**: 使用 Docker 卷管理数据持久化
6. **端口配置**: 修改对外端口时，需要同时更新 `docker-compose.yml` 和环境变量配置

### 本地开发注意事项
1. **服务启动顺序**: 先启动 Milvus 服务，再启动嵌入服务，最后启动数据库服务
2. **模型文件**: 确保本地模型文件存在于 `Backend/models/` 目录
3. **Milvus 服务**: 确保 Milvus 服务正在运行（端口 19530）
4. **端口冲突**: 确保 3001 和 3002 端口未被占用（或自定义端口未被占用）
5. **内存使用**: 嵌入服务会加载模型到内存，注意内存使用情况
6. **端口配置**: 本地开发时，服务端口由 `shared.config.js` 配置管理

### 常见问题解决
1. **模块找不到错误**: 重新构建 Docker 镜像 `docker-compose build --no-cache`
2. **服务重启循环**: 检查环境变量配置和依赖服务连接
3. **容器间通信失败**: 检查 Docker 网络配置
4. **模型加载失败**: 检查模型文件路径和权限
5. **端口访问失败**: 检查端口映射配置和防火墙设置
6. **服务无法启动**: 检查端口是否被占用，修改 `docker-compose.yml` 中的端口映射

## 📄 许可证

MIT License