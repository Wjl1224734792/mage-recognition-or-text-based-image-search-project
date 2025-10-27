/**
 * 共享配置文件
 * 统一管理所有服务的配置参数
 */

/**
 * 并发控制配置
 */
export const CONCURRENCY_CONFIG = {
  // 数据库操作并发数量（支持环境变量覆盖）
  DATABASE_MAX_CONCURRENCY: parseInt(process.env.DATABASE_MAX_CONCURRENCY) || 10,
  // 嵌入请求并发数量（支持环境变量覆盖）
  EMBEDDING_MAX_CONCURRENCY: parseInt(process.env.EMBEDDING_MAX_CONCURRENCY) || 5,
  // 默认重试次数（支持环境变量覆盖）
  DEFAULT_RETRIES: parseInt(process.env.DEFAULT_RETRIES) || 3,
  // 默认重试延迟(ms)（支持环境变量覆盖）
  DEFAULT_RETRY_DELAY: parseInt(process.env.DEFAULT_RETRY_DELAY) || 1000,
  // 默认任务超时时间(ms)（支持环境变量覆盖）
  DEFAULT_TIMEOUT: parseInt(process.env.DEFAULT_TIMEOUT) || 30000
};

/**
 * HTTP 请求配置
 */
export const HTTP_CONFIG = {
  // 嵌入服务基础URL（支持环境变量覆盖）
  EMBEDDING_SERVICE_URL: process.env.EMBEDDING_SERVICE_URL || 'http://localhost:3002',
  // 数据库服务端口（支持环境变量覆盖）
  DATABASE_SERVICE_PORT: parseInt(process.env.DATABASE_SERVICE_PORT) || 3001,
  // 嵌入服务端口（支持环境变量覆盖）
  EMBEDDING_SERVICE_PORT: parseInt(process.env.EMBEDDING_SERVICE_PORT) || 3002,
  // 请求超时时间(ms)（支持环境变量覆盖）
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  // 重试次数（支持环境变量覆盖）
  REQUEST_RETRIES: parseInt(process.env.REQUEST_RETRIES) || 3,
  // 重试延迟(ms)（支持环境变量覆盖）
  REQUEST_RETRY_DELAY: parseInt(process.env.REQUEST_RETRY_DELAY) || 1000
};

/**
 * Milvus 配置
 */
export const MILVUS_CONFIG = {
  // Milvus 连接配置（支持环境变量覆盖）
  HOST: process.env.MILVUS_HOST || 'localhost',
  PORT: parseInt(process.env.MILVUS_PORT) || 19530,
  // 认证配置（支持环境变量覆盖）
  USERNAME: process.env.MILVUS_USERNAME || 'root',
  PASSWORD: process.env.MILVUS_PASSWORD || 'Milvus',
  // 集合配置（支持环境变量覆盖）
  COLLECTION_NAME: process.env.MILVUS_COLLECTION_NAME || 'image_vectors',
  // 向量维度（支持环境变量覆盖）
  VECTOR_DIMENSION: parseInt(process.env.MILVUS_VECTOR_DIMENSION) || 768,
  // 搜索配置（支持环境变量覆盖）
  SEARCH_LIMIT: parseInt(process.env.MILVUS_SEARCH_LIMIT) || 20,
  // 索引配置
  INDEX_TYPE: 'HNSW',
  INDEX_PARAMS: {
    metric_type: 'L2',
    params: JSON.stringify({
      M: 16,
      efConstruction: 200
    })
  }
};

/**
 * 嵌入模型配置
 */
export const EMBEDDING_CONFIG = {
  // 默认模型（支持环境变量覆盖）
  DEFAULT_MODEL: process.env.EMBEDDING_DEFAULT_MODEL || 'Marqo/marqo-fashionSigLIP',
  // 模型配置
  MODELS: {
    'Marqo/marqo-fashionSigLIP': {
      modelId: 'Marqo/marqo-fashionSigLIP',
      task: 'image-feature-extraction',
      options: {
        pool: true
      }
    }
  },
  // 本地模型路径（支持环境变量覆盖）
  LOCAL_MODEL_PATH: process.env.MODEL_PATH || './models',
  // 缓存目录（支持环境变量覆盖）
  CACHE_DIR: process.env.CACHE_DIR || './.cache'
};

/**
 * 服务配置
 */
export const SERVICE_CONFIG = {
  // 数据库服务配置
  DATABASE: {
    name: 'database-service',
    port: HTTP_CONFIG.DATABASE_SERVICE_PORT,
    description: 'Milvus 向量数据库服务'
  },
  // 嵌入服务配置
  EMBEDDING: {
    name: 'embedding-service',
    port: HTTP_CONFIG.EMBEDDING_SERVICE_PORT,
    description: '图像嵌入服务'
  }
};

/**
 * 获取配置值
 * @param {string} key - 配置键，支持点号分隔的嵌套键
 * @param {any} defaultValue - 默认值
 * @returns {any} 配置值
 */
export function getConfig(key, defaultValue = undefined) {
  const keys = key.split('.');
  let value = {
    CONCURRENCY: CONCURRENCY_CONFIG,
    HTTP: HTTP_CONFIG,
    MILVUS: MILVUS_CONFIG,
    EMBEDDING: EMBEDDING_CONFIG,
    SERVICE: SERVICE_CONFIG
  };

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }

  return value;
}

/**
 * 验证配置
 * @returns {Object} 验证结果
 */
export function validateConfig() {
  const errors = [];
  const warnings = [];

  // 验证端口配置
  if (HTTP_CONFIG.DATABASE_SERVICE_PORT === HTTP_CONFIG.EMBEDDING_SERVICE_PORT) {
    errors.push('数据库服务和嵌入服务不能使用相同端口');
  }

  // 验证并发配置
  if (CONCURRENCY_CONFIG.DATABASE_MAX_CONCURRENCY <= 0) {
    errors.push('数据库并发数量必须大于0');
  }

  if (CONCURRENCY_CONFIG.EMBEDDING_MAX_CONCURRENCY <= 0) {
    errors.push('嵌入并发数量必须大于0');
  }

  // 验证超时配置
  if (HTTP_CONFIG.REQUEST_TIMEOUT <= 0) {
    warnings.push('请求超时时间应该大于0');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  CONCURRENCY_CONFIG,
  HTTP_CONFIG,
  MILVUS_CONFIG,
  EMBEDDING_CONFIG,
  SERVICE_CONFIG,
  getConfig,
  validateConfig
};
