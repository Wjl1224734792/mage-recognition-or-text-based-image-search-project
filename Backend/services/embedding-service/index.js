/**
 * 嵌入服务入口文件
 * 提供图像特征提取 API
 */

import express from 'express';
import cors from 'cors';
import { embeddingRoutes } from './routes/embedding.routes.js';
import { CONCURRENCY_CONFIG, HTTP_CONFIG, EMBEDDING_CONFIG } from '../../config/shared.config.js';

const app = express();
const PORT = HTTP_CONFIG.EMBEDDING_SERVICE_PORT;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 路由配置 - 添加 v1 版本前缀
app.use('/api/v1/embedding', embeddingRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'embedding-service',
    timestamp: new Date().toISOString(),
    config: {
      port: PORT,
      maxConcurrency: CONCURRENCY_CONFIG.EMBEDDING_MAX_CONCURRENCY,
      defaultModel: EMBEDDING_CONFIG.DEFAULT_MODEL
    }
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    service: 'embedding-service',
    version: '1.0.0',
    description: '图像嵌入服务，提供图像特征提取 API',
    endpoints: {
      health: '/health',
      embedding: '/api/v1/embedding'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('嵌入服务错误:', err);
  res.status(500).json({
    success: false,
    error: '内部服务器错误',
    message: err.message
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    message: `路径 ${req.originalUrl} 不存在`
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log('🚀 嵌入服务启动成功!');
  console.log(`⚙️  并发配置: ${CONCURRENCY_CONFIG.EMBEDDING_MAX_CONCURRENCY} 个并发任务`);
  console.log(`🤖 默认模型已配置`);
});

export default app;
