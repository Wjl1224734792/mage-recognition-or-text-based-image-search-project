/**
 * 数据库服务入口文件
 * 提供 Milvus 向量数据库操作 API
 */

import express from 'express';
import cors from 'cors';
import { milvusRoutes } from './routes/milvus.routes.js';
import { CONCURRENCY_CONFIG } from '../../config/shared.config.js';

const app = express();
const PORT = 3001;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 路由配置 - 添加 v1 版本前缀
app.use('/api/v1/milvus', milvusRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'database-service',
    timestamp: new Date().toISOString(),
    config: {
      port: PORT,
      maxConcurrency: CONCURRENCY_CONFIG.DATABASE_MAX_CONCURRENCY,
      milvusHost: '已配置',
      milvusPort: '已配置',
      collectionName: '已配置'
    }
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    service: 'database-service',
    version: '1.0.0',
    description: 'Milvus 向量数据库服务，提供向量存储和搜索 API',
    endpoints: {
      health: '/health',
      milvus: '/api/v1/milvus'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('数据库服务错误:', err);
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
app.listen(PORT, async () => {
  console.log('🚀 数据库服务启动成功!');
  
  // 自动初始化数据库连接和集合
  try {
    console.log('\n🔄 正在初始化数据库连接...');
    const milvusService = (await import('./services/milvus.service.js')).default;
    await milvusService.autoInitialize();
    console.log('✅ 数据库初始化完成，服务就绪！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error('💡 请检查 Milvus 服务是否正在运行');
    process.exit(1);
  }
});

export default app;
