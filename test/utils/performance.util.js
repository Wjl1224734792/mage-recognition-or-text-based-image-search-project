/**
 * 性能测试工具类
 * 分层架构 - 工具层
 */
import { performance } from 'perf_hooks';
import chalk from 'chalk';

export class PerformanceUtil {
  constructor() {
    this.metrics = {
      requests: [],
      startTime: null,
      endTime: null,
      errors: 0,
      successes: 0
    };
  }
  
  /**
   * 开始性能测试
   */
  startTest() {
    this.metrics.startTime = performance.now();
    console.log(chalk.yellow('🚀 性能测试开始...'));
  }
  
  /**
   * 结束性能测试
   */
  endTest() {
    this.metrics.endTime = performance.now();
    console.log(chalk.yellow('🏁 性能测试结束'));
  }
  
  /**
   * 记录请求
   */
  recordRequest(success, responseTime, error = null) {
    const request = {
      timestamp: Date.now(),
      success,
      responseTime,
      error: error?.message || null
    };
    
    this.metrics.requests.push(request);
    
    if (success) {
      this.metrics.successes++;
    } else {
      this.metrics.errors++;
    }
  }
  
  /**
   * 计算QPS (每秒查询数)
   */
  calculateQPS() {
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    return this.metrics.requests.length / duration;
  }
  
  /**
   * 计算TPS (每秒事务数)
   */
  calculateTPS() {
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    return this.metrics.successes / duration;
  }
  
  /**
   * 计算平均响应时间
   */
  calculateAverageRT() {
    if (this.metrics.requests.length === 0) return 0;
    
    const totalTime = this.metrics.requests.reduce((sum, req) => sum + req.responseTime, 0);
    return totalTime / this.metrics.requests.length;
  }
  
  /**
   * 计算P95响应时间
   */
  calculateP95RT() {
    if (this.metrics.requests.length === 0) return 0;
    
    const sortedTimes = this.metrics.requests
      .map(req => req.responseTime)
      .sort((a, b) => a - b);
    
    const index = Math.ceil(sortedTimes.length * 0.95) - 1;
    return sortedTimes[index] || 0;
  }
  
  /**
   * 计算P99响应时间
   */
  calculateP99RT() {
    if (this.metrics.requests.length === 0) return 0;
    
    const sortedTimes = this.metrics.requests
      .map(req => req.responseTime)
      .sort((a, b) => a - b);
    
    const index = Math.ceil(sortedTimes.length * 0.99) - 1;
    return sortedTimes[index] || 0;
  }
  
  /**
   * 计算错误率
   */
  calculateErrorRate() {
    const total = this.metrics.requests.length;
    if (total === 0) return 0;
    return (this.metrics.errors / total) * 100;
  }
  
  /**
   * 计算成功率
   */
  calculateSuccessRate() {
    const total = this.metrics.requests.length;
    if (total === 0) return 0;
    return (this.metrics.successes / total) * 100;
  }
  
  /**
   * 计算吞吐量
   */
  calculateThroughput() {
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    return this.metrics.requests.length / duration;
  }
  
  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    
    return {
      summary: {
        totalRequests: this.metrics.requests.length,
        successfulRequests: this.metrics.successes,
        failedRequests: this.metrics.errors,
        duration: duration,
        concurrency: 3 // 固定并发数
      },
      metrics: {
        qps: this.calculateQPS(),
        tps: this.calculateTPS(),
        averageRT: this.calculateAverageRT(),
        p95RT: this.calculateP95RT(),
        p99RT: this.calculateP99RT(),
        errorRate: this.calculateErrorRate(),
        successRate: this.calculateSuccessRate(),
        throughput: this.calculateThroughput()
      },
      requests: this.metrics.requests
    };
  }
  
  /**
   * 重置指标
   */
  reset() {
    this.metrics = {
      requests: [],
      startTime: null,
      endTime: null,
      errors: 0,
      successes: 0
    };
  }
  
  /**
   * 打印实时性能指标
   */
  printRealTimeMetrics() {
    const qps = this.calculateQPS();
    const avgRT = this.calculateAverageRT();
    const errorRate = this.calculateErrorRate();
    
    console.log(chalk.cyan(`📊 实时指标: QPS=${qps.toFixed(2)}, RT=${avgRT.toFixed(2)}ms, 错误率=${errorRate.toFixed(2)}%`));
  }
}

export default PerformanceUtil;
