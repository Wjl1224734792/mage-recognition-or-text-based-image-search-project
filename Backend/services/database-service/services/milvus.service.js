/**
 * Milvus 数据库服务
 * 处理向量数据库操作，集成嵌入服务调用
 */

import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { MILVUS_CONFIG, CONCURRENCY_CONFIG, HTTP_CONFIG } from '../../../config/shared.config.js';
import { ConcurrencyController } from '../../../utils/concurrency.util.js';
import { HttpClient } from '../../../utils/http.util.js';

/**
 * Milvus 数据库服务类
 */
class MilvusService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isInitialized = false;
    
    // 创建并发控制器
    this.concurrencyController = new ConcurrencyController({
      maxConcurrency: CONCURRENCY_CONFIG.DATABASE_MAX_CONCURRENCY,
      retryDelay: CONCURRENCY_CONFIG.DEFAULT_RETRY_DELAY,
      defaultTimeout: CONCURRENCY_CONFIG.DEFAULT_TIMEOUT
    });

    // 创建 HTTP 客户端用于调用嵌入服务
    this.httpClient = new HttpClient({
      baseURL: HTTP_CONFIG.EMBEDDING_SERVICE_URL,
      timeout: HTTP_CONFIG.REQUEST_TIMEOUT,
      retries: HTTP_CONFIG.REQUEST_RETRIES,
      retryDelay: HTTP_CONFIG.REQUEST_RETRY_DELAY
    });

    // 启动并发控制器
    this.concurrencyController.start();
    
    // 监听事件
    this.concurrencyController.on('taskCompleted', (result) => {
      console.log(`✅ 数据库任务完成`);
    });

    this.concurrencyController.on('taskFailed', (result) => {
      console.error(`❌ 数据库任务失败, 错误: ${result.error.message}`);
    });
  }

  /**
   * 自动初始化服务
   */
  async autoInitialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 初始化数据库服务...');
      
      // 连接 Milvus
      await this.connect();
      
      // 确保集合存在
      await this.ensureCollection();
      
      this.isInitialized = true;
      console.log('✅ 数据库服务初始化完成');
    } catch (error) {
      console.error('❌ 数据库服务初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 连接到 Milvus
   */
  async connect() {
    if (this.isConnected) return;

    try {
      console.log(`🔄 正在连接 Milvus`);
      
      this.client = new MilvusClient({
        address: `${MILVUS_CONFIG.HOST}:${MILVUS_CONFIG.PORT}`,
        database: 'default', // 连接到默认数据库
        username: MILVUS_CONFIG.USERNAME,
        password: MILVUS_CONFIG.PASSWORD
      });

      // 测试连接 - 使用简单的健康检查
      await this.client.checkHealth();
      
      this.isConnected = true;
      console.log(`✅ Milvus 连接成功`);
    } catch (error) {
      console.error('❌ Milvus 连接失败:', error.message);
      console.error('💡 请确保 Milvus 服务正在运行');
      throw error;
    }
  }

  /**
   * 确保集合存在
   */
  async ensureCollection() {
    try {
      
      const hasCollection = await this.client.hasCollection({
        collection_name: MILVUS_CONFIG.COLLECTION_NAME
      });

      if (!hasCollection.value) {
        console.log(`🔄 集合不存在，正在创建`);
        await this.createCollection();
        console.log(`✅ 集合创建成功`);
      } else {
        console.log(`✅ 集合已存在`);
        
        // 检查集合是否已加载
        const isLoaded = await this.client.getLoadState({
          collection_name: MILVUS_CONFIG.COLLECTION_NAME
        });
        
        if (isLoaded.state !== 'LoadStateLoaded') {
          console.log(`🔄 加载集合到内存`);
          await this.client.loadCollection({
            collection_name: MILVUS_CONFIG.COLLECTION_NAME
          });
          console.log(`✅ 集合加载完成`);
        } else {
          console.log(`✅ 集合已加载`);
        }
      }
    } catch (error) {
      console.error('❌ 确保集合存在失败:', error.message);
      throw error;
    }
  }


  /**
   * 创建集合
   */
  async createCollection() {
    try {
      const schema = {
        collection_name: MILVUS_CONFIG.COLLECTION_NAME,
        description: '图像向量集合',
        fields: [
          {
            name: 'row_id',
            data_type: 'VarChar',
            is_primary_key: true,
            max_length: 36
          },
          {
            name: 'image_vector',
            data_type: 'FloatVector',
            dim: MILVUS_CONFIG.VECTOR_DIMENSION
          }
        ]
      };

      await this.client.createCollection(schema);
      console.log(`✅ 集合创建成功`);

      // 创建HNSW索引
      console.log(`🔄 创建HNSW索引...`);
      await this.client.createIndex({
        collection_name: MILVUS_CONFIG.COLLECTION_NAME,
        field_name: 'image_vector',
        index_type: 'HNSW',
        metric_type: 'L2',
        params: {
          M: 16,
          efConstruction: 200
        }
      });
      console.log(`✅ HNSW索引创建成功`);

      // 加载集合到内存
      console.log(`🔄 加载集合到内存...`);
      await this.client.loadCollection({
        collection_name: MILVUS_CONFIG.COLLECTION_NAME
      });
      console.log(`✅ 集合加载完成`);
    } catch (error) {
      console.error('❌ 集合创建失败:', error.message);
      throw error;
    }
  }

  /**
   * 调用嵌入服务提取特征
   * @param {string|Blob} imageInput - 图像输入
   * @returns {Promise<Array>} 特征向量
   */
  async callEmbeddingService(imageInput) {
    let isBlobInput = false;
    let blobSize = 0;
    
    try {
      console.log('🔄 调用嵌入服务提取特征...');
      
      let response;
      
      // 根据输入类型选择不同的接口
      if (imageInput instanceof Blob) {
        isBlobInput = true;
        blobSize = imageInput.size;
        console.log(`📦 使用Blob接口，大小: ${blobSize} bytes`);
        
        // 将Blob对象转换为可以通过HTTP传递的格式
        const arrayBuffer = await imageInput.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blobData = {
          data: Array.from(uint8Array),
          type: imageInput.type || 'image/jpeg'
        };
        
        response = await this.httpClient.post('/api/v1/embedding/extract/blob', {
          imageBlob: blobData
        });
      } else if (typeof imageInput === 'string') {
        console.log(`🔗 使用URL接口: ${imageInput.substring(0, 50)}...`);
        response = await this.httpClient.post('/api/v1/embedding/extract', {
          imageInput
        });
      } else {
        throw new Error(`不支持的图像输入类型: ${typeof imageInput}`);
      }

      if (!response.success) {
        throw new Error(`嵌入服务调用失败: ${response.message}`);
      }

      console.log(`✅ 特征提取成功`);
      return response.data.data.features;
    } catch (error) {
      console.error('❌ 嵌入服务调用失败:', error.message);
      throw error;
    } finally {
      // 如果是Blob输入，记录清理信息
      if (isBlobInput) {
        try {
          console.log(`🧹 Blob对象已传递给嵌入服务，大小: ${blobSize} bytes`);
          // 注意：这里不能直接清理imageInput，因为它可能还在被调用者使用
          // 清理工作由调用者（如searchSimilarVectorsWithBlob）负责
        } catch (cleanupError) {
          console.warn('⚠️ Blob传递记录警告:', cleanupError.message);
        }
      }
    }
  }

  /**
   * 插入图像向量（使用并发控制）
   * @param {string} rowId - 行ID
   * @param {string|Blob} imageInput - 图像输入
   * @returns {Promise<Object>} 插入结果
   */
  async insertImageVector(rowId, imageInput) {
    // 确保服务已初始化
    await this.autoInitialize();

    const taskConfig = {
      id: `insert-${rowId}`,
      task: async () => {
        // 调用嵌入服务提取特征
        const features = await this.callEmbeddingService(imageInput);

        // 插入向量到数据库
        const result = await this.client.insert({
          collection_name: MILVUS_CONFIG.COLLECTION_NAME,
          data: [{
            row_id: rowId,
            image_vector: features
          }]
        });

        return {
          success: true,
          data: {
            row_id: rowId,
            insert_count: "1"
          },
          message: '图像向量插入成功'
        };
      },
      priority: 1,
      retries: CONCURRENCY_CONFIG.DEFAULT_RETRIES,
      timeout: CONCURRENCY_CONFIG.DEFAULT_TIMEOUT
    };

    return await this.concurrencyController.addTask(taskConfig);
  }

  /**
   * 更新图像向量（使用并发控制）
   * @param {string} rowId - 行ID
   * @param {string|Blob} imageInput - 图像输入
   * @returns {Promise<Object>} 更新结果
   */
  async updateImageVector(rowId, imageInput) {
    // 确保服务已初始化
    await this.autoInitialize();

    const taskConfig = {
      id: `update-${rowId}`,
      task: async () => {
        // 调用嵌入服务提取特征
        const features = await this.callEmbeddingService(imageInput);

        // 更新向量到数据库
        const result = await this.client.upsert({
          collection_name: MILVUS_CONFIG.COLLECTION_NAME,
          data: [{
            row_id: rowId,
            image_vector: features
          }]
        });

        return {
          success: true,
          data: {
            row_id: rowId,
            upsert_count: "1"
          },
          message: '图像向量更新成功'
        };
      },
      priority: 1,
      retries: CONCURRENCY_CONFIG.DEFAULT_RETRIES,
      timeout: CONCURRENCY_CONFIG.DEFAULT_TIMEOUT
    };

    return await this.concurrencyController.addTask(taskConfig);
  }

  /**
   * 同步图像向量（检查是否存在，不存在则插入）
   * @param {string} rowId - 行ID
   * @param {string|Blob} imageInput - 图像输入
   * @returns {Promise<Object>} 同步结果
   */
  async syncImageVector(rowId, imageInput) {
    // 确保服务已初始化
    await this.autoInitialize();

    const taskConfig = {
      id: `sync-${rowId}`,
      task: async () => {
        try {
          // 1. 先检查数据库中是否已存在该 rowId
          console.log(`🔍 检查 rowId 是否存在`);
          
          const existingData = await this.client.get({
            collection_name: MILVUS_CONFIG.COLLECTION_NAME,
            ids: [rowId],
            output_fields: ['row_id']
          });

          // 检查是否已存在数据
          const exists = existingData.data && existingData.data.length > 0;
          
          if (exists) {
            console.log(`✅ 数据已存在，跳过插入`);
            return {
              success: true,
              data: {
                row_id: rowId,
                action: 'skipped',
                reason: '数据已存在'
              },
              message: '数据已存在，跳过插入'
            };
          }

          // 2. 如果不存在，调用嵌入服务提取特征
          console.log(`🔄 数据不存在，开始提取特征`);
          const features = await this.callEmbeddingService(imageInput);

          // 3. 插入向量到数据库
          console.log(`💾 插入向量到数据库`);
          const result = await this.client.insert({
            collection_name: MILVUS_CONFIG.COLLECTION_NAME,
            data: [{
              row_id: rowId,
              image_vector: features
            }]
          });

          return {
            success: true,
            data: {
              row_id: rowId,
              action: 'inserted',
              insert_count: "1",
              dimension: features.length
            },
            message: '图像向量同步成功'
          };

        } catch (error) {
          console.error(`❌ 同步图像向量失败: ${error.message}`);
          throw error;
        }
      },
      priority: 1,
      retries: CONCURRENCY_CONFIG.DEFAULT_RETRIES,
      timeout: CONCURRENCY_CONFIG.DEFAULT_TIMEOUT
    };

    return await this.concurrencyController.addTask(taskConfig);
  }

  /**
   * 批量删除图像向量（使用并发控制）
   * @param {Array<string>} rowIds - 行ID数组
   * @returns {Promise<Object>} 删除结果
   */
  async batchDeleteImageVectors(rowIds) {
    // 确保服务已初始化
    await this.autoInitialize();

    if (!Array.isArray(rowIds) || rowIds.length === 0) {
      throw new Error('rowIds 参数必须是非空数组');
    }

    const taskConfig = {
      id: `batch-delete-${rowIds.length}`,
      task: async () => {
        // 构建删除表达式
        const expr = `row_id in [${rowIds.map(id => `"${id}"`).join(', ')}]`;

        const result = await this.client.deleteEntities({
          collection_name: MILVUS_CONFIG.COLLECTION_NAME,
          expr: expr
        });

        return {
          success: true,
          data: {
            deletedCount: rowIds.length,
            deleteIds: result.deleteIDs
          },
          message: '批量删除成功'
        };
      },
      priority: 0,
      retries: CONCURRENCY_CONFIG.DEFAULT_RETRIES,
      timeout: CONCURRENCY_CONFIG.DEFAULT_TIMEOUT
    };

    return await this.concurrencyController.addTask(taskConfig);
  }

  /**
   * 搜索相似向量（使用并发控制）
   * @param {string|Blob} imageInput - 图像输入
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchSimilarVectors(imageInput, options = {}) {
    // 确保服务已初始化
    await this.autoInitialize();

    const taskConfig = {
      id: `search-${Date.now()}`,
      task: async () => {
        // 调用嵌入服务提取特征
        const features = await this.callEmbeddingService(imageInput);

        // 搜索相似向量
        const searchParams = {
          collection_name: MILVUS_CONFIG.COLLECTION_NAME,
          vector: features,
          limit: options.limit || MILVUS_CONFIG.SEARCH_LIMIT,
          output_fields: options.output_fields || ['row_id'],
          metric_type: 'L2'
        };

        const result = await this.client.search(searchParams);

        return {
          success: true,
          data: result.results,
          message: '相似向量搜索成功'
        };
      },
      priority: 2,
      retries: CONCURRENCY_CONFIG.DEFAULT_RETRIES,
      timeout: CONCURRENCY_CONFIG.DEFAULT_TIMEOUT
    };

    return await this.concurrencyController.addTask(taskConfig);
  }

  /**
   * 获取集合统计信息
   * @returns {Promise<Object>} 集合统计信息
   */
  async getCollectionStats() {
    // 确保服务已初始化
    await this.autoInitialize();

    const taskConfig = {
      id: `collection-stats-${Date.now()}`,
      task: async () => {
        try {
          // 获取集合统计信息
          const stats = await this.client.getCollectionStatistics({
            collection_name: MILVUS_CONFIG.COLLECTION_NAME
          });

          return {
            rowCount: stats.row_count || 0
          };
        } catch (error) {
          console.error('❌ 获取集合统计信息失败:', error.message);
          throw error;
        }
      },
      priority: 1,
      retries: 2,
      timeout: 10000
    };

    return await this.concurrencyController.addTask(taskConfig);
  }

  /**
   * 获取服务统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      isConnected: this.isConnected,
      isInitialized: this.isInitialized,
      concurrencyStats: this.concurrencyController.getStats()
    };
  }

  /**
   * 停止服务
   */
  stop() {
    this.concurrencyController.stop();
    if (this.client) {
      this.client.closeConnection();
    }
    this.isConnected = false;
    this.isInitialized = false;
    console.log('🛑 数据库服务已停止');
  }
}

// 创建单例实例
const milvusService = new MilvusService();

export { MilvusService };
export default milvusService;
