/**
 * 并发控制工具类
 * 分层架构 - 工具层
 */
import PQueue from 'p-queue';
import { performance } from 'perf_hooks';
import chalk from 'chalk';

export class ConcurrencyUtil {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.queue = new PQueue({ 
      concurrency,
      interval: 1000,
      intervalCap: concurrency
    });
    this.activeTasks = new Set();
    this.completedTasks = 0;
    this.failedTasks = 0;
  }
  
  /**
   * 添加任务到队列
   */
  async addTask(taskFunction, taskName = 'unnamed') {
    const taskId = `${taskName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return this.queue.add(async () => {
      const startTime = performance.now();
      this.activeTasks.add(taskId);
      
      try {
        console.log(chalk.blue(`🔄 开始执行任务: ${taskName} (ID: ${taskId})`));
        const result = await taskFunction();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.completedTasks++;
        console.log(chalk.green(`✅ 任务完成: ${taskName} (耗时: ${duration.toFixed(2)}ms)`));
        
        return {
          success: true,
          result,
          duration,
          taskId,
          taskName
        };
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.failedTasks++;
        console.log(chalk.red(`❌ 任务失败: ${taskName} (耗时: ${duration.toFixed(2)}ms) - ${error.message}`));
        
        return {
          success: false,
          error: error.message,
          duration,
          taskId,
          taskName
        };
      } finally {
        this.activeTasks.delete(taskId);
      }
    });
  }
  
  /**
   * 批量添加任务
   */
  async addBatchTasks(tasks, batchName = 'batch') {
    console.log(chalk.yellow(`📦 添加批量任务: ${batchName} (${tasks.length}个任务)`));
    
    const promises = tasks.map((task, index) => 
      this.addTask(task.function, `${batchName}_${index + 1}`)
    );
    
    return Promise.allSettled(promises);
  }
  
  /**
   * 等待所有任务完成
   */
  async waitForCompletion() {
    console.log(chalk.yellow('⏳ 等待所有任务完成...'));
    await this.queue.onIdle();
    console.log(chalk.green('🎉 所有任务已完成'));
  }
  
  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      concurrency: this.concurrency,
      pending: this.queue.pending,
      size: this.queue.size,
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      isPaused: this.queue.isPaused
    };
  }
  
  /**
   * 暂停队列
   */
  pause() {
    this.queue.pause();
    console.log(chalk.yellow('⏸️ 队列已暂停'));
  }
  
  /**
   * 恢复队列
   */
  resume() {
    this.queue.start();
    console.log(chalk.green('▶️ 队列已恢复'));
  }
  
  /**
   * 清空队列
   */
  clear() {
    this.queue.clear();
    this.activeTasks.clear();
    this.completedTasks = 0;
    this.failedTasks = 0;
    console.log(chalk.yellow('🧹 队列已清空'));
  }
  
  /**
   * 设置并发数
   */
  setConcurrency(concurrency) {
    this.concurrency = concurrency;
    this.queue.concurrency = concurrency;
    console.log(chalk.blue(`🔧 并发数设置为: ${concurrency}`));
  }
  
  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const totalTasks = this.completedTasks + this.failedTasks;
    const successRate = totalTasks > 0 ? (this.completedTasks / totalTasks) * 100 : 0;
    
    return {
      totalTasks,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      successRate: successRate.toFixed(2),
      activeTasks: this.activeTasks.size,
      queueSize: this.queue.size,
      queuePending: this.queue.pending
    };
  }
  
  /**
   * 打印实时状态
   */
  printRealTimeStatus() {
    const status = this.getQueueStatus();
    const stats = this.getPerformanceStats();
    
    console.log(chalk.cyan(`📊 队列状态: 活跃=${status.activeTasks}, 待处理=${status.pending}, 已完成=${stats.completedTasks}, 失败=${stats.failedTasks}`));
  }
}

export default ConcurrencyUtil;
