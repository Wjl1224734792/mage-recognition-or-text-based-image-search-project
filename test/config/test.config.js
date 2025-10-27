/**
 * 测试配置文件
 * 分层架构 - 配置层
 */
export const testConfig = {
  // 基础配置
  baseUrl: 'http://localhost:3001',
  timeout: 30000,
  
  // 测试数据配置
  testData: {
    sampleImageUrl: 'https://p1.mingdaoyun.cn/08e2825b-c10b-43b9-89b1-c7f5ba5a770a/43ec1c14-758c-441f-8a83-5ceeec13a369/688e02ab8b7cf09a3c293179/20251015/6J5F0H0FdH8I4R759Vft8Q6s5L9ldz7Pf02l1B3Z8T6A0F1w235Udv3Qch5sfR0w.jpg?e=1761464870&token=mN_sp-Y4_5zePppXZC8fTktRmKMNiYlC8jl_yeGZ:mV8Ytzr1e2BUBll6hfZmNoDL8eI=&imageView2/2/interlace/1',
    sampleRowId: 'test_' + Date.now(),
    batchSize: 10
  },
  
  // 性能测试配置
  performance: {
    concurrency: 3, // 并发数
    duration: 60, // 测试持续时间（秒）
    rampUpTime: 10, // 预热时间（秒）
    thinkTime: 1, // 思考时间（秒）
    maxRequests: 1000 // 最大请求数
  },
  
  // 测试报告配置
  reports: {
    outputDir: './reports',
    formats: ['json', 'html', 'csv'],
    includeMetrics: ['qps', 'tps', 'rt', 'errorRate', 'throughput']
  },
  
  // API端点配置
  endpoints: {
    health: '/health',
    stats: '/api/v1/milvus/stats',
    insert: '/api/v1/milvus/insert',
    sync: '/api/v1/milvus/sync',
    update: '/api/v1/milvus/update',
    search: '/api/v1/milvus/search',
    batchDelete: '/api/v1/milvus/batch-delete'
  },
  
  // 断言配置
  assertions: {
    responseTime: {
      warning: 1000, // 警告阈值（毫秒）
      critical: 3000 // 严重阈值（毫秒）
    },
    successRate: {
      minimum: 0.95 // 最低成功率
    }
  }
};

export default testConfig;
