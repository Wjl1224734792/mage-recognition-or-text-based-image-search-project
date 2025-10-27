/**
 * HTTP工具类
 * 分层架构 - 工具层
 */
import axios from 'axios';
import chalk from 'chalk';

export class HttpUtil {
  constructor(baseURL, timeout = 30000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(chalk.blue(`🚀 ${config.method?.toUpperCase()} ${config.url}`));
        return config;
      },
      (error) => {
        console.error(chalk.red('❌ 请求错误:'), error);
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(chalk.green(`✅ ${response.status} ${response.config.url}`));
        return response;
      },
      (error) => {
        console.error(chalk.red(`❌ ${error.response?.status || 'ERROR'} ${error.config?.url}`));
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * GET请求
   */
  async get(url, params = {}) {
    try {
      const response = await this.client.get(url, { params });
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * POST请求
   */
  async post(url, data = {}) {
    try {
      const response = await this.client.post(url, data);
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * 错误处理
   */
  handleError(error) {
    const errorResponse = {
      success: false,
      error: error.message,
      status: error.response?.status || 0,
      data: error.response?.data || null
    };
    
    console.error(chalk.red('HTTP错误详情:'), errorResponse);
    return errorResponse;
  }
  
  /**
   * 健康检查
   */
  async healthCheck() {
    return await this.get('/health');
  }
  
  /**
   * 获取集合统计
   */
  async getStats() {
    return await this.get('/api/v1/milvus/stats');
  }
  
  /**
   * 插入向量
   */
  async insertVector(rowId, imageInput) {
    return await this.post('/api/v1/milvus/insert', {
      rowId,
      imageInput
    });
  }
  
  /**
   * 同步向量
   */
  async syncVector(rowId, imageInput) {
    return await this.post('/api/v1/milvus/sync', {
      rowId,
      imageInput
    });
  }
  
  /**
   * 更新向量
   */
  async updateVector(rowId, imageInput) {
    return await this.post('/api/v1/milvus/update', {
      rowId,
      imageInput
    });
  }
  
  /**
   * 搜索向量
   */
  async searchVector(imageInput, limit = 20) {
    return await this.post('/api/v1/milvus/search', {
      imageInput,
      limit
    });
  }
  
  /**
   * 批量删除
   */
  async batchDelete(rowIds) {
    return await this.post('/api/v1/milvus/batch-delete', {
      rowIds
    });
  }
}

export default HttpUtil;
