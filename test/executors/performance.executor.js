/**
 * 性能测试执行器
 * 分层架构 - 执行层
 */
import DatabaseTestService from '../services/database.test.service.js';
import ConcurrencyUtil from '../utils/concurrency.util.js';
import PerformanceUtil from '../utils/performance.util.js';
import { testConfig } from '../config/test.config.js';
import chalk from 'chalk';
import moment from 'moment';

export class PerformanceTestExecutor {
  constructor() {
    this.testService = new DatabaseTestService();
    this.concurrencyUtil = new ConcurrencyUtil(testConfig.performance.concurrency);
    this.performanceUtil = new PerformanceUtil();
    this.startTime = null;
    this.endTime = null;
  }
  
  /**
   * 执行性能测试
   */
  async execute() {
    console.log(chalk.blue('⚡ 开始执行性能测试...'));
    console.log(chalk.gray(`测试时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`));
    console.log(chalk.gray(`并发数: ${testConfig.performance.concurrency}`));
    console.log(chalk.gray(`测试持续时间: ${testConfig.performance.duration}秒`));
    console.log(chalk.gray('='.repeat(50)));
    
    this.startTime = Date.now();
    this.performanceUtil.startTest();
    
    try {
      // 预热阶段
      await this.warmUp();
      
      // 正式测试阶段
      await this.runPerformanceTests();
      
      // 等待所有任务完成
      await this.concurrencyUtil.waitForCompletion();
      
      this.endTime = Date.now();
      this.performanceUtil.endTest();
      
      // 生成性能报告
      const report = this.performanceUtil.getPerformanceReport();
      this.generatePerformanceReport(report);
      
      return report;
    } catch (error) {
      console.error(chalk.red('❌ 性能测试执行失败:'), error);
      throw error;
    }
  }
  
  /**
   * 预热阶段
   */
  async warmUp() {
    console.log(chalk.yellow('🔥 预热阶段...'));
    
    const warmUpTasks = [];
    for (let i = 0; i < testConfig.performance.concurrency; i++) {
      warmUpTasks.push({
        function: () => this.testService.testHealthCheck(),
        name: `warmup_${i + 1}`
      });
    }
    
    await this.concurrencyUtil.addBatchTasks(warmUpTasks, 'warmup');
    await this.concurrencyUtil.waitForCompletion();
    
    console.log(chalk.green('✅ 预热完成'));
  }
  
  /**
   * 运行性能测试
   */
  async runPerformanceTests() {
    console.log(chalk.yellow('🚀 开始正式性能测试...'));
    
    const testDuration = testConfig.performance.duration * 1000; // 转换为毫秒
    const startTime = Date.now();
    
    // 创建测试任务
    const testTasks = this.createTestTasks();
    
    // 启动性能监控
    const monitorInterval = setInterval(() => {
      this.performanceUtil.printRealTimeMetrics();
      this.concurrencyUtil.printRealTimeStatus();
    }, 5000);
    
    // 执行测试任务
    const testPromises = [];
    let taskCounter = 0;
    
    while (Date.now() - startTime < testDuration) {
      // 添加新任务到队列
      const task = testTasks[taskCounter % testTasks.length];
      const promise = this.concurrencyUtil.addTask(
        task.function,
        `${task.name}_${taskCounter + 1}`
      );
      
      testPromises.push(promise);
      
      // 记录性能指标
      promise.then(result => {
        this.performanceUtil.recordRequest(
          result.success,
          result.duration,
          result.error
        );
      });
      
      taskCounter++;
      
      // 控制任务添加频率
      await new Promise(resolve => setTimeout(resolve, testConfig.performance.thinkTime * 1000));
    }
    
    // 清理监控
    clearInterval(monitorInterval);
    
    console.log(chalk.green('✅ 性能测试执行完成'));
  }
  
  /**
   * 创建测试任务
   */
  createTestTasks() {
    return [
      {
        name: 'health_check',
        function: () => this.testService.testHealthCheck()
      },
      {
        name: 'stats',
        function: () => this.testService.testStats()
      },
      {
        name: 'insert',
        function: () => this.testService.testInsert()
      },
      {
        name: 'sync',
        function: () => this.testService.testSync()
      },
      {
        name: 'update',
        function: () => this.testService.testUpdate()
      },
      {
        name: 'search',
        function: () => this.testService.testSearch()
      },
      {
        name: 'batch_delete',
        function: () => this.testService.testBatchDelete()
      }
    ];
  }
  
  /**
   * 生成性能报告
   */
  generatePerformanceReport(report) {
    console.log(chalk.gray('='.repeat(50)));
    console.log(chalk.yellow('📊 性能测试报告'));
    console.log(chalk.gray('='.repeat(50)));
    
    const { summary, metrics } = report;
    
    // 基础统计
    console.log(chalk.blue('📈 基础统计:'));
    console.log(chalk.cyan(`总请求数: ${summary.totalRequests}`));
    console.log(chalk.cyan(`成功请求数: ${summary.successfulRequests}`));
    console.log(chalk.cyan(`失败请求数: ${summary.failedRequests}`));
    console.log(chalk.cyan(`测试持续时间: ${summary.duration.toFixed(2)}秒`));
    console.log(chalk.cyan(`并发数: ${summary.concurrency}`));
    
    // 性能指标
    console.log(chalk.blue('\n⚡ 性能指标:'));
    console.log(chalk.green(`QPS (每秒查询数): ${metrics.qps.toFixed(2)}`));
    console.log(chalk.green(`TPS (每秒事务数): ${metrics.tps.toFixed(2)}`));
    console.log(chalk.green(`平均响应时间: ${metrics.averageRT.toFixed(2)}ms`));
    console.log(chalk.green(`P95响应时间: ${metrics.p95RT.toFixed(2)}ms`));
    console.log(chalk.green(`P99响应时间: ${metrics.p99RT.toFixed(2)}ms`));
    console.log(chalk.green(`错误率: ${metrics.errorRate.toFixed(2)}%`));
    console.log(chalk.green(`成功率: ${metrics.successRate.toFixed(2)}%`));
    console.log(chalk.green(`吞吐量: ${metrics.throughput.toFixed(2)} req/s`));
    
    // 性能评估
    this.evaluatePerformance(metrics);
    
    // 性能建议
    this.generatePerformanceRecommendations(metrics);
  }
  
  /**
   * 性能评估
   */
  evaluatePerformance(metrics) {
    console.log(chalk.blue('\n🎯 性能评估:'));
    
    // QPS评估
    if (metrics.qps > 100) {
      console.log(chalk.green('✅ QPS表现优秀 (>100)'));
    } else if (metrics.qps > 50) {
      console.log(chalk.yellow('⚠️  QPS表现良好 (50-100)'));
    } else {
      console.log(chalk.red('❌ QPS表现较差 (<50)'));
    }
    
    // 响应时间评估
    if (metrics.averageRT < 500) {
      console.log(chalk.green('✅ 响应时间优秀 (<500ms)'));
    } else if (metrics.averageRT < 1000) {
      console.log(chalk.yellow('⚠️  响应时间良好 (500-1000ms)'));
    } else {
      console.log(chalk.red('❌ 响应时间较差 (>1000ms)'));
    }
    
    // 成功率评估
    if (metrics.successRate >= 99) {
      console.log(chalk.green('✅ 成功率优秀 (≥99%)'));
    } else if (metrics.successRate >= 95) {
      console.log(chalk.yellow('⚠️  成功率良好 (95-99%)'));
    } else {
      console.log(chalk.red('❌ 成功率较差 (<95%)'));
    }
  }
  
  /**
   * 生成性能建议
   */
  generatePerformanceRecommendations(metrics) {
    console.log(chalk.blue('\n💡 性能优化建议:'));
    
    const recommendations = [];
    
    if (metrics.averageRT > 1000) {
      recommendations.push('考虑优化数据库查询性能');
      recommendations.push('检查网络延迟和带宽');
      recommendations.push('优化服务器资源配置');
    }
    
    if (metrics.errorRate > 5) {
      recommendations.push('检查服务稳定性');
      recommendations.push('增加错误处理和重试机制');
      recommendations.push('监控系统资源使用情况');
    }
    
    if (metrics.qps < 50) {
      recommendations.push('考虑增加并发处理能力');
      recommendations.push('优化代码执行效率');
      recommendations.push('使用缓存机制减少重复计算');
    }
    
    if (metrics.p95RT > 2000) {
      recommendations.push('优化慢查询');
      recommendations.push('考虑数据库索引优化');
      recommendations.push('实施连接池管理');
    }
    
    if (recommendations.length === 0) {
      console.log(chalk.green('🎉 性能表现良好，无需特别优化'));
    } else {
      recommendations.forEach((rec, index) => {
        console.log(chalk.yellow(`${index + 1}. ${rec}`));
      });
    }
  }
  
  /**
   * 获取性能摘要
   */
  getPerformanceSummary(report) {
    const { summary, metrics } = report;
    
    return {
      totalRequests: summary.totalRequests,
      successfulRequests: summary.successfulRequests,
      failedRequests: summary.failedRequests,
      duration: summary.duration,
      concurrency: summary.concurrency,
      qps: metrics.qps,
      tps: metrics.tps,
      averageRT: metrics.averageRT,
      p95RT: metrics.p95RT,
      p99RT: metrics.p99RT,
      errorRate: metrics.errorRate,
      successRate: metrics.successRate,
      throughput: metrics.throughput,
      timestamp: new Date().toISOString()
    };
  }
}

export default PerformanceTestExecutor;

// 主执行逻辑
async function main() {
  const executor = new PerformanceTestExecutor();
  
  try {
    console.log(chalk.blue('🚀 性能测试执行器启动'));
    const results = await executor.execute();
    
    // 生成报告
    console.log(chalk.yellow('📊 生成性能测试报告...'));
    const { ReportGenerator } = await import('../reports/report.generator.js');
    const reportGenerator = new ReportGenerator();
    
    const reportData = {
      testType: 'performance',
      summary: executor.getPerformanceSummary(results),
      performance: executor.getPerformanceSummary(results)
    };
    
    const reports = await reportGenerator.generateAllReports(reportData);
    
    // 显示报告路径
    console.log(chalk.blue('📊 性能测试报告已生成:'));
    Object.entries(reports).forEach(([format, path]) => {
      const formatEmoji = {
        json: '📄',
        html: '🌐',
        csv: '📊'
      };
      console.log(chalk.cyan(`${formatEmoji[format]} ${format.toUpperCase()}报告: ${path}`));
    });
    
    console.log(chalk.green('🎉 性能测试执行完成'));
    return results;
  } catch (error) {
    console.error(chalk.red('❌ 性能测试执行失败:'), error);
    process.exit(1);
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ 未处理的Promise拒绝:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ 未捕获的异常:'), error);
  process.exit(1);
});

// 启动测试
main().catch(error => {
  console.error(chalk.red('❌ 测试执行失败:'), error);
  process.exit(1);
});
