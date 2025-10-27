/**
 * 并发控制工具类
 * 提供任务队列管理、并发控制、错误处理等功能
 */

/**
 * 任务配置接口
 * @typedef {Object} TaskConfig
 * @property {string} id - 任务唯一标识
 * @property {Function} task - 任务函数
 * @property {any} [data] - 任务数据
 * @property {number} [priority=0] - 任务优先级（数字越大优先级越高）
 * @property {number} [retries=0] - 重试次数
 * @property {number} [retryDelay=1000] - 重试延迟(ms)
 * @property {number} [timeout=30000] - 任务超时时间(ms)
 * @property {Function} [onSuccess] - 成功回调
 * @property {Function} [onError] - 错误回调
 * @property {Function} [onComplete] - 完成回调
 */

/**
 * 任务结果接口
 * @typedef {Object} TaskResult
 * @property {string} id - 任务ID
 * @property {boolean} success - 是否成功
 * @property {any} data - 结果数据
 * @property {Error} [error] - 错误信息
 * @property {number} duration - 执行时长(ms)
 * @property {number} retryCount - 重试次数
 */

/**
 * 并发控制器类
 */
class ConcurrencyController {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 5;
    this.maxQueueSize = options.maxQueueSize || 1000;
    this.retryDelay = options.retryDelay || 1000;
    this.defaultTimeout = options.defaultTimeout || 30000;
    
    // 任务队列
    this.taskQueue = [];
    this.runningTasks = new Map();
    this.completedTasks = new Map();
    
    // 状态管理
    this.isRunning = false;
    this.isPaused = false;
    
    // 统计信息
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      retriedTasks: 0,
      startTime: null,
      endTime: null
    };
    
    // 事件监听器
    this.eventListeners = new Map();
  }

  /**
   * 添加任务到队列
   * @param {TaskConfig} taskConfig - 任务配置
   * @returns {Promise<TaskResult>} 任务结果
   */
  async addTask(taskConfig) {
    return new Promise((resolve, reject) => {
      // 验证任务配置
      if (!taskConfig.id || !taskConfig.task) {
        reject(new Error('任务配置无效：缺少 id 或 task'));
        return;
      }

      // 检查队列大小
      if (this.taskQueue.length >= this.maxQueueSize) {
        reject(new Error(`队列已满，最大容量：${this.maxQueueSize}`));
        return;
      }

      // 创建任务对象
      const task = {
        ...taskConfig,
        resolve,
        reject,
        createdAt: Date.now(),
        attempts: 0
      };

      // 按优先级插入队列
      this.insertTaskByPriority(task);
      this.stats.totalTasks++;

      // 触发任务添加事件
      this.emit('taskAdded', task);

      // 如果控制器正在运行且未暂停，立即处理任务
      if (this.isRunning && !this.isPaused) {
        this.processNextTask();
      }
    });
  }

  /**
   * 按优先级插入任务
   * @param {Object} task - 任务对象
   * @private
   */
  insertTaskByPriority(task) {
    const priority = task.priority || 0;
    let insertIndex = this.taskQueue.length;

    // 从后往前查找插入位置
    for (let i = this.taskQueue.length - 1; i >= 0; i--) {
      if (this.taskQueue[i].priority >= priority) {
        insertIndex = i + 1;
        break;
      }
    }

    this.taskQueue.splice(insertIndex, 0, task);
  }

  /**
   * 批量添加任务
   * @param {TaskConfig[]} taskConfigs - 任务配置数组
   * @returns {Promise<TaskResult[]>} 任务结果数组
   */
  async addTasks(taskConfigs) {
    const promises = taskConfigs.map(config => this.addTask(config));
    return Promise.allSettled(promises);
  }

  /**
   * 启动并发控制器
   */
  start() {
    if (this.isRunning) {
      console.warn('并发控制器已在运行');
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.stats.startTime = Date.now();
    
    this.emit('started');
    this.processNextTask();
  }

  /**
   * 暂停控制器
   */
  pause() {
    this.isPaused = true;
    this.emit('paused');
  }

  /**
   * 恢复控制器
   */
  resume() {
    this.isPaused = false;
    this.emit('resumed');
    this.processNextTask();
  }

  /**
   * 停止控制器
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.stats.endTime = Date.now();
    
    // 取消所有运行中的任务
    this.runningTasks.forEach(task => {
      if (task.abortController) {
        task.abortController.abort();
      }
    });
    
    this.emit('stopped');
  }

  /**
   * 处理下一个任务
   * @private
   */
  async processNextTask() {
    // 检查是否可以处理新任务
    if (!this.isRunning || this.isPaused || this.runningTasks.size >= this.maxConcurrency) {
      return;
    }

    // 获取下一个任务
    const task = this.taskQueue.shift();
    if (!task) {
      return;
    }

    // 执行任务
    this.executeTask(task);
  }

  /**
   * 执行任务
   * @param {Object} task - 任务对象
   * @private
   */
  async executeTask(task) {
    const startTime = Date.now();
    task.attempts++;
    
    // 创建中止控制器
    const abortController = new AbortController();
    task.abortController = abortController;
    
    // 添加到运行中任务
    this.runningTasks.set(task.id, task);
    
    try {
      // 设置超时
      const timeout = task.timeout || this.defaultTimeout;
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);

      // 执行任务
      const result = await this.runTaskWithRetry(task, abortController.signal);
      
      clearTimeout(timeoutId);
      
      // 任务成功
      const duration = Date.now() - startTime;
      const taskResult = {
        id: task.id,
        success: true,
        data: result,
        duration,
        retryCount: task.attempts - 1
      };

      this.completedTasks.set(task.id, taskResult);
      this.stats.completedTasks++;
      
      // 调用成功回调
      if (task.onSuccess) {
        task.onSuccess(taskResult);
      }
      
      // 调用完成回调
      if (task.onComplete) {
        task.onComplete(taskResult);
      }
      
      task.resolve(taskResult);
      this.emit('taskCompleted', taskResult);

    } catch (error) {
      // 任务失败
      const duration = Date.now() - startTime;
      const taskResult = {
        id: task.id,
        success: false,
        error,
        duration,
        retryCount: task.attempts - 1
      };

      this.completedTasks.set(task.id, taskResult);
      this.stats.failedTasks++;
      
      // 调用错误回调
      if (task.onError) {
        task.onError(taskResult);
      }
      
      // 调用完成回调
      if (task.onComplete) {
        task.onComplete(taskResult);
      }
      
      task.reject(taskResult);
      this.emit('taskFailed', taskResult);
    } finally {
      // 清理
      this.runningTasks.delete(task.id);
      
      // 处理下一个任务
      this.processNextTask();
    }
  }

  /**
   * 带重试机制的任务执行
   * @param {Object} task - 任务对象
   * @param {AbortSignal} signal - 中止信号
   * @returns {Promise<any>} 任务结果
   * @private
   */
  async runTaskWithRetry(task, signal) {
    const maxRetries = task.retries || 0;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 检查是否被中止
        if (signal.aborted) {
          throw new Error('任务被中止');
        }

        // 执行任务函数
        const result = await task.task(task.data, signal);
        return result;

      } catch (error) {
        lastError = error;
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          this.stats.retriedTasks++;
          const delay = task.retryDelay || this.retryDelay;
          await this.delay(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟时间(ms)
   * @returns {Promise<void>}
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取任务状态
   * @param {string} taskId - 任务ID
   * @returns {Object|null} 任务状态
   */
  getTaskStatus(taskId) {
    if (this.runningTasks.has(taskId)) {
      return { status: 'running', task: this.runningTasks.get(taskId) };
    }
    
    if (this.completedTasks.has(taskId)) {
      return { status: 'completed', result: this.completedTasks.get(taskId) };
    }
    
    const queuedTask = this.taskQueue.find(task => task.id === taskId);
    if (queuedTask) {
      return { status: 'queued', task: queuedTask };
    }
    
    return null;
  }

  /**
   * 取消任务
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否成功取消
   */
  cancelTask(taskId) {
    // 取消运行中的任务
    if (this.runningTasks.has(taskId)) {
      const task = this.runningTasks.get(taskId);
      if (task.abortController) {
        task.abortController.abort();
      }
      this.runningTasks.delete(taskId);
      return true;
    }
    
    // 从队列中移除任务
    const queueIndex = this.taskQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      const task = this.taskQueue.splice(queueIndex, 1)[0];
      task.reject(new Error('任务被取消'));
      return true;
    }
    
    return false;
  }

  /**
   * 清空队列
   */
  clearQueue() {
    // 取消所有队列中的任务
    this.taskQueue.forEach(task => {
      task.reject(new Error('队列被清空'));
    });
    this.taskQueue = [];
    this.emit('queueCleared');
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const now = Date.now();
    const duration = this.stats.startTime ? (this.stats.endTime || now) - this.stats.startTime : 0;
    
    return {
      ...this.stats,
      duration,
      queueSize: this.taskQueue.length,
      runningTasks: this.runningTasks.size,
      completedTasks: this.completedTasks.size,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      successRate: this.stats.totalTasks > 0 ? 
        (this.stats.completedTasks / this.stats.totalTasks * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   */
  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {...any} args - 事件参数
   * @private
   */
  emit(event, ...args) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`事件监听器错误 (${event}):`, error);
        }
      });
    }
  }
}

/**
 * 并发工具函数
 */
class ConcurrencyUtils {
  /**
   * 限制并发数量的 Promise 执行
   * @param {Function[]} tasks - 任务函数数组
   * @param {number} concurrency - 并发数量
   * @returns {Promise<any[]>} 结果数组
   */
  static async limitConcurrency(tasks, concurrency = 5) {
    const results = [];
    const executing = [];
    
    for (const task of tasks) {
      const promise = task().then(result => {
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });
      
      results.push(promise);
      executing.push(promise);
      
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
    
    return Promise.all(results);
  }

  /**
   * 批量处理数据
   * @param {any[]} data - 数据数组
   * @param {Function} processor - 处理函数
   * @param {number} batchSize - 批次大小
   * @param {number} concurrency - 并发数量
   * @returns {Promise<any[]>} 处理结果
   */
  static async batchProcess(data, processor, batchSize = 10, concurrency = 3) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    
    const batchTasks = batches.map(batch => () => 
      Promise.all(batch.map(item => processor(item)))
    );
    
    const results = await this.limitConcurrency(batchTasks, concurrency);
    return results.flat();
  }

  /**
   * 创建任务池
   * @param {number} poolSize - 池大小
   * @returns {Object} 任务池对象
   */
  static createTaskPool(poolSize = 5) {
    const pool = [];
    const queue = [];
    
    // 初始化工作线程
    for (let i = 0; i < poolSize; i++) {
      pool.push({ id: i, busy: false });
    }
    
    return {
      async execute(task) {
        return new Promise((resolve, reject) => {
          const taskWrapper = { task, resolve, reject };
          queue.push(taskWrapper);
          this.processQueue();
        });
      },
      
      async processQueue() {
        const availableWorker = pool.find(worker => !worker.busy);
        if (!availableWorker || queue.length === 0) return;
        
        const { task, resolve, reject } = queue.shift();
        availableWorker.busy = true;
        
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          availableWorker.busy = false;
          this.processQueue();
        }
      }
    };
  }
}

// 创建默认实例
const defaultController = new ConcurrencyController();

// 导出
export { ConcurrencyController, ConcurrencyUtils };
export default defaultController;
