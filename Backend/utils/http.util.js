/**
 * HTTP 请求工具类
 * 基于 fetch API 封装的请求工具，支持拦截器、重试、超时等功能
 */

/**
 * 请求配置接口
 * @typedef {Object} RequestConfig
 * @property {string} url - 请求URL
 * @property {string} [method='GET'] - 请求方法
 * @property {Object} [headers] - 请求头
 * @property {any} [data] - 请求数据
 * @property {number} [timeout=10000] - 超时时间(ms)
 * @property {number} [retries=0] - 重试次数
 * @property {number} [retryDelay=1000] - 重试延迟(ms)
 * @property {boolean} [withCredentials=false] - 是否携带凭证
 * @property {string} [responseType='json'] - 响应类型
 */

/**
 * 响应接口
 * @typedef {Object} Response
 * @property {boolean} success - 是否成功
 * @property {any} data - 响应数据
 * @property {number} status - HTTP状态码
 * @property {string} message - 响应消息
 * @property {Object} headers - 响应头
 */

class HttpClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 0;
    this.retryDelay = options.retryDelay || 1000;
    this.withCredentials = options.withCredentials || false;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // 拦截器
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];

    // 请求取消控制器
    this.abortControllers = new Map();
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * 执行请求拦截器
   * @param {RequestConfig} config - 请求配置
   * @returns {RequestConfig} 处理后的配置
   */
  async executeRequestInterceptors(config) {
    let processedConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  /**
   * 执行响应拦截器
   * @param {Response} response - 响应对象
   * @returns {Response} 处理后的响应
   */
  async executeResponseInterceptors(response) {
    let processedResponse = { ...response };

    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    return processedResponse;
  }

  /**
   * 执行错误拦截器
   * @param {Error} error - 错误对象
   * @returns {Error} 处理后的错误
   */
  async executeErrorInterceptors(error) {
    let processedError = error;

    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }

    return processedError;
  }

  /**
   * 创建 AbortController
   * @param {string} requestId - 请求ID
   * @returns {AbortController} 控制器
   */
  createAbortController(requestId) {
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    return controller;
  }

  /**
   * 取消请求
   * @param {string} requestId - 请求ID
   */
  cancelRequest(requestId) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests() {
    for (const [requestId, controller] of this.abortControllers) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  /**
   * 构建完整URL
   * @param {string} url - 相对URL
   * @returns {string} 完整URL
   */
  buildURL(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return this.baseURL ? `${this.baseURL}${url.startsWith('/') ? '' : '/'}${url}` : url;
  }

  /**
   * 构建请求配置
   * @param {RequestConfig} config - 请求配置
   * @returns {Object} fetch配置
   */
  buildRequestConfig(config) {
    const {
      method = 'GET',
      headers = {},
      data,
      withCredentials = this.withCredentials,
      signal
    } = config;

    const requestConfig = {
      method: method.toUpperCase(),
      headers: {
        ...this.defaultHeaders,
        ...headers
      },
      credentials: withCredentials ? 'include' : 'same-origin',
      signal
    };

    // 添加请求体
    if (data && method.toUpperCase() !== 'GET') {
      if (data instanceof FormData) {
        delete requestConfig.headers['Content-Type'];
        requestConfig.body = data;
      } else if (typeof data === 'object') {
        requestConfig.body = JSON.stringify(data);
      } else {
        requestConfig.body = data;
      }
    }

    return requestConfig;
  }

  /**
   * 处理响应
   * @param {Response} response - fetch响应
   * @param {string} responseType - 响应类型
   * @returns {Promise<any>} 处理后的数据
   */
  async handleResponse(response, responseType = 'json') {
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    let data;
    switch (responseType) {
      case 'text':
        data = await response.text();
        break;
      case 'blob':
        data = await response.blob();
        break;
      case 'arrayBuffer':
        data = await response.arrayBuffer();
        break;
      case 'json':
      default:
        try {
          data = await response.json();
        } catch (error) {
          data = await response.text();
        }
        break;
    }

    return {
      success: true,
      data,
      status: response.status,
      message: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟时间(ms)
   * @returns {Promise} Promise对象
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 执行请求
   * @param {RequestConfig} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  async request(config) {
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 执行请求拦截器
      const processedConfig = await this.executeRequestInterceptors(config);

      // 构建完整URL
      const url = this.buildURL(processedConfig.url);

      // 创建超时控制器
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), processedConfig.timeout || this.timeout);

      // 创建请求控制器
      const requestController = this.createAbortController(requestId);

      // 合并信号
      const signal = processedConfig.signal ||
        (requestController.signal && timeoutController.signal ?
          AbortSignal.any([requestController.signal, timeoutController.signal]) :
          requestController.signal || timeoutController.signal);

      // 构建请求配置
      const requestConfig = this.buildRequestConfig({
        ...processedConfig,
        signal
      });

      // 执行请求
      const response = await fetch(url, requestConfig);

      // 清除超时
      clearTimeout(timeoutId);

      // 处理响应
      const result = await this.handleResponse(response, processedConfig.responseType || 'json');

      // 执行响应拦截器
      const processedResult = await this.executeResponseInterceptors(result);

      // 清理控制器
      this.abortControllers.delete(requestId);

      return processedResult;

    } catch (error) {
      // 执行错误拦截器
      const processedError = await this.executeErrorInterceptors(error);

      // 清理控制器
      this.abortControllers.delete(requestId);

      // 重试逻辑
      if (config.retries > 0 && !processedError.name?.includes('AbortError')) {
        await this.delay(config.retryDelay || this.retryDelay);
        return this.request({
          ...config,
          retries: config.retries - 1
        });
      }

      throw processedError;
    }
  }

  /**
   * GET 请求
   * @param {string} url - 请求URL
   * @param {Object} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  get(url, config = {}) {
    return this.request({ url, method: 'GET', ...config });
  }

  /**
   * POST 请求
   * @param {string} url - 请求URL
   * @param {any} data - 请求数据
   * @param {Object} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  post(url, data, config = {}) {
    return this.request({ url, method: 'POST', data, ...config });
  }

  /**
   * PUT 请求
   * @param {string} url - 请求URL
   * @param {any} data - 请求数据
   * @param {Object} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  put(url, data, config = {}) {
    return this.request({ url, method: 'PUT', data, ...config });
  }

  /**
   * PATCH 请求
   * @param {string} url - 请求URL
   * @param {any} data - 请求数据
   * @param {Object} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  patch(url, data, config = {}) {
    return this.request({ url, method: 'PATCH', data, ...config });
  }

  /**
   * DELETE 请求
   * @param {string} url - 请求URL
   * @param {Object} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  delete(url, config = {}) {
    return this.request({ url, method: 'DELETE', ...config });
  }

  /**
   * 上传文件
   * @param {string} url - 请求URL
   * @param {FormData} formData - 表单数据
   * @param {Object} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  upload(url, formData, config = {}) {
    return this.request({
      url,
      method: 'POST',
      data: formData,
      headers: {
        // 不设置 Content-Type，让浏览器自动设置
        ...config.headers
      },
      ...config
    });
  }

  /**
   * 下载文件
   * @param {string} url - 请求URL
   * @param {Object} config - 请求配置
   * @returns {Promise<Response>} 响应结果
   */
  download(url, config = {}) {
    return this.request({
      url,
      method: 'GET',
      responseType: 'blob',
      ...config
    });
  }
}

// 创建默认实例
const httpClient = new HttpClient();

// 导出类和实例
export { HttpClient };
export default httpClient;
