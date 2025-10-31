/**
 * 嵌入服务业务逻辑
 * 处理图像特征提取请求
 */

import { pipeline } from '@huggingface/transformers';
import { env } from '@huggingface/transformers';
import path from 'path';
import { fileURLToPath } from 'url';
import { EMBEDDING_CONFIG, CONCURRENCY_CONFIG } from '../../../config/shared.config.js';
import { ConcurrencyController } from '../../../utils/concurrency.util.js';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置 Transformers.js 环境 - 仅使用本地模型
env.cacheDir = path.join(__dirname, '..', '..', '..', '.cache');
env.useFSCache = true;
env.allowRemoteModels = false; // 禁用远程模型下载
env.allowLocalModels = true;  // 启用本地模型
env.localModelPath = path.join(__dirname, '..', '..', '..', 'models'); // 本地模型路径

/**
 * 嵌入服务类
 */
class EmbeddingService {
  constructor() {
    this.loadedModels = new Map();
    this.isInitialized = false;
    
    // 创建并发控制器
    this.concurrencyController = new ConcurrencyController({
      maxConcurrency: CONCURRENCY_CONFIG.EMBEDDING_MAX_CONCURRENCY,
      retryDelay: CONCURRENCY_CONFIG.DEFAULT_RETRY_DELAY,
      defaultTimeout: CONCURRENCY_CONFIG.DEFAULT_TIMEOUT
    });

    // 启动并发控制器
    this.concurrencyController.start();
    
    // 监听事件
    this.concurrencyController.on('taskCompleted', (result) => {
      // 任务完成日志已移除
    });

    this.concurrencyController.on('taskFailed', (result) => {
      console.error(`❌ 嵌入任务失败: ${result.error.message}`);
    });
  }

  /**
   * 自动初始化服务
   */
  async autoInitialize() {
    if (this.isInitialized) return;

    try {
      // 加载默认模型
      await this.loadModel(EMBEDDING_CONFIG.DEFAULT_MODEL);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ 嵌入服务初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 加载模型
   * @param {string} modelName - 模型名称
   * @returns {Promise<Object>} 加载结果
   */
  async loadModel(modelName) {
    if (this.loadedModels.has(modelName)) {
      return {
        success: true,
        message: `模型 ${modelName} 已加载`,
        model: this.loadedModels.get(modelName)
      };
    }

    try {
      const modelConfig = EMBEDDING_CONFIG.MODELS[modelName];
      if (!modelConfig) {
        throw new Error(`未找到模型配置: ${modelName}`);
      }

      // 检查本地模型文件
      const hasLocalModel = await this.checkLocalModel(modelName);
      if (!hasLocalModel) {
        throw new Error(`本地模型文件不存在: ${modelName}`);
      }

      // 创建管道
      const extractor = await pipeline(
        modelConfig.task,
        modelConfig.modelId,
        modelConfig.options
      );

      this.loadedModels.set(modelName, extractor);
      
      return {
        success: true,
        message: `模型 ${modelName} 加载成功`,
        model: extractor,
        usedLocalModel: true
      };
    } catch (error) {
      console.error(`❌ 模型加载失败:`, error.message);
      throw error;
    }
  }

  /**
   * 检查本地模型文件
   * @param {string} modelName - 模型名称
   * @returns {Promise<boolean>} 是否存在本地模型
   */
  async checkLocalModel(modelName) {
    try {
      const fs = await import('fs/promises');
      const modelPath = path.join(env.localModelPath, modelName);
      
      try {
        const stats = await fs.stat(modelPath);
        if (stats.isDirectory()) {
          const files = await fs.readdir(modelPath);
          return files.length > 0;
        }
      } catch (error) {
        return false;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ 检查本地模型失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 提取图像特征（通过URL）
   * @param {string} imageInput - 图像URL
   * @returns {Promise<Object>} 特征提取结果
   */
  async extractFeatures(imageInput) {
    // 确保服务已初始化
    await this.autoInitialize();

    // 验证输入
    if (!imageInput) {
      throw new Error('图像输入不能为空');
    }

    // 验证输入类型（只接受URL字符串）
    if (typeof imageInput !== 'string') {
      throw new Error('extractFeatures 只接受字符串类型的URL输入');
    }

    // 检查是否为 Base64 编码（不支持）
    if (imageInput.startsWith('data:image/')) {
      throw new Error('不支持 Base64 编码的图像输入，请使用 URL 或 Blob 对象');
    }

    try {
      // 确保默认模型已加载
      const modelName = EMBEDDING_CONFIG.DEFAULT_MODEL;
      if (!this.loadedModels.has(modelName)) {
        await this.loadModel(modelName);
      }

      const extractor = this.loadedModels.get(modelName);
      
      const features = await extractor(imageInput);
      
      // 处理特征数据 - 确保是数值数组
      let featureArray;
      
      // 处理特征数据
      
      if (Array.isArray(features)) {
        // 如果已经是数组，检查是否包含对象
        if (features.length > 0 && typeof features[0] === 'object' && features[0].ort_tensor) {
          // 如果是包含ort_tensor对象的数组，提取cpuData
          const tensorData = features[0].ort_tensor.cpuData;
          // 提取tensor数据
          
          if (tensorData && typeof tensorData === 'object') {
            // 将cpuData对象转换为数值数组，按索引排序
            const sortedKeys = Object.keys(tensorData).map(Number).sort((a, b) => a - b);
            featureArray = sortedKeys.map(key => tensorData[key]);
            // 特征数组转换完成
          } else {
            // 如果tensorData无效，保持原数组
            featureArray = features;
            // 使用原始数组
          }
        } else {
          featureArray = features;
          // 使用原始数组
        }
      } else if (features && typeof features === 'object' && 'data' in features) {
        // 如果是对象包含data属性，提取data
        featureArray = Array.isArray(features.data) ? features.data : Array.from(features.data);
        // 从data属性提取
      } else if (features && typeof features === 'object' && 'image_embeds' in features) {
        // 如果是对象包含image_embeds属性，提取image_embeds
        featureArray = Array.isArray(features.image_embeds) ? features.image_embeds : Array.from(features.image_embeds);
        // 从image_embeds属性提取
      } else {
        // 其他情况，尝试转换为数组
        try {
          featureArray = Array.from(features);
          // 使用Array.from转换
        } catch (error) {
          console.error('❌ Array.from转换失败:', error.message);
          throw new Error(`无法处理特征数据格式: ${typeof features}`);
        }
      }
      
      // 确保是数值数组
      
      if (!Array.isArray(featureArray)) {
        console.error('❌ featureArray不是数组');
        throw new Error(`特征提取结果不是数组，类型: ${typeof featureArray}`);
      }
      
      if (featureArray.length === 0) {
        console.error('❌ featureArray为空数组');
        throw new Error('特征提取结果为空数组');
      }
      
      // 验证特征向量是否为数值
      const isValidFeatures = featureArray.every(feature => 
        typeof feature === 'number' && !isNaN(feature) && isFinite(feature)
      );
      
      if (!isValidFeatures) {
        console.error('❌ 特征向量包含非数值数据');
        throw new Error('特征向量包含非数值数据');
      }
      
      return {
        success: true,
        data: {
          features: featureArray,
          dimension: featureArray.length
        },
        message: '特征提取成功'
      };
    } catch (error) {
      console.error('❌ 特征提取失败:', error.message);
      throw error;
    }
  }

  /**
   * 提取图像特征（通过Blob对象）
   * @param {Blob} imageBlob - 图像Blob对象
   * @returns {Promise<Object>} 特征提取结果
   */
  async extractFeaturesFromBlob(imageBlob) {
    // 确保服务已初始化
    await this.autoInitialize();

    // 验证输入
    if (!imageBlob) {
      throw new Error('图像Blob对象不能为空');
    }

    // 验证Blob对象类型
    if (!(imageBlob instanceof Blob)) {
      throw new Error('extractFeaturesFromBlob 只接受Blob对象输入');
    }

    // 验证Blob对象大小
    if (imageBlob.size === 0) {
      throw new Error('图像Blob对象不能为空');
    }

    // 验证MIME类型
    if (!imageBlob.type.startsWith('image/')) {
      throw new Error('Blob对象必须是图像类型');
    }

    let result = null;
    
    try {
      // 确保默认模型已加载
      const modelName = EMBEDDING_CONFIG.DEFAULT_MODEL;
      if (!this.loadedModels.has(modelName)) {
        await this.loadModel(modelName);
      }

      const extractor = this.loadedModels.get(modelName);
      
      const features = await extractor(imageBlob);
      
      // 处理特征数据 - 确保是数值数组
      let featureArray;
      
      // 处理特征数据
      
      if (Array.isArray(features)) {
        // 如果已经是数组，检查是否包含对象
        if (features.length > 0 && typeof features[0] === 'object' && features[0].ort_tensor) {
          // 如果是包含ort_tensor对象的数组，提取cpuData
          const tensorData = features[0].ort_tensor.cpuData;
          // 提取tensor数据
          
          if (tensorData && typeof tensorData === 'object') {
            // 将cpuData对象转换为数值数组，按索引排序
            const sortedKeys = Object.keys(tensorData).map(Number).sort((a, b) => a - b);
            featureArray = sortedKeys.map(key => tensorData[key]);
            // 特征数组转换完成
          } else {
            // 如果tensorData无效，保持原数组
            featureArray = features;
            // 使用原始数组
          }
        } else {
          featureArray = features;
          // 使用原始数组
        }
      } else if (features && typeof features === 'object' && 'data' in features) {
        // 如果是对象包含data属性，提取data
        featureArray = Array.isArray(features.data) ? features.data : Array.from(features.data);
        // 从data属性提取
      } else if (features && typeof features === 'object' && 'image_embeds' in features) {
        // 如果是对象包含image_embeds属性，提取image_embeds
        featureArray = Array.isArray(features.image_embeds) ? features.image_embeds : Array.from(features.image_embeds);
        // 从image_embeds属性提取
      } else {
        // 其他情况，尝试转换为数组
        try {
          featureArray = Array.from(features);
          // 使用Array.from转换
        } catch (error) {
          console.error('❌ Array.from转换失败:', error.message);
          throw new Error(`无法处理特征数据格式: ${typeof features}`);
        }
      }
      
      // 确保是数值数组
      
      if (!Array.isArray(featureArray)) {
        console.error('❌ featureArray不是数组');
        throw new Error(`特征提取结果不是数组，类型: ${typeof featureArray}`);
      }
      
      if (featureArray.length === 0) {
        console.error('❌ featureArray为空数组');
        throw new Error('特征提取结果为空数组');
      }
      
      // 验证特征向量是否为数值
      const isValidFeatures = featureArray.every(feature => 
        typeof feature === 'number' && !isNaN(feature) && isFinite(feature)
      );
      
      if (!isValidFeatures) {
        console.error('❌ 特征向量包含非数值数据');
        throw new Error('特征向量包含非数值数据');
      }
      
      result = {
        success: true,
        data: {
          features: featureArray,
          dimension: featureArray.length
        },
        message: 'Blob特征提取成功'
      };
      
      return result;
    } catch (error) {
      console.error('❌ Blob特征提取失败:', error.message);
      throw error;
    } finally {
      // 清理Blob对象引用
      try {
        imageBlob = null;
      } catch (cleanupError) {
        // 清理失败，静默处理
      }
    }
  }


  /**
   * 停止服务
   */
  stop() {
    this.concurrencyController.stop();
    this.loadedModels.clear();
    this.isInitialized = false;
  }
}

// 创建单例实例
const embeddingService = new EmbeddingService();

export { EmbeddingService };
export default embeddingService;
