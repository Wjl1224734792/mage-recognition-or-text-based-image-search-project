/**
 * 测试主入口文件
 * 分层架构 - 入口层
 */
import TestExecutor from './executors/test.executor.js';
import ReportGenerator from './reports/report.generator.js';
import { testConfig } from './config/test.config.js';
import chalk from 'chalk';
import moment from 'moment';

class TestRunner {
  constructor() {
    this.testExecutor = new TestExecutor();
    this.reportGenerator = new ReportGenerator();
  }
  
  /**
   * 主执行函数
   */
  async run() {
    console.log(chalk.blue('🚀 Milvus API 测试套件启动'));
    console.log(chalk.gray(`启动时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`));
    console.log(chalk.gray(`测试配置: 并发数=${testConfig.performance.concurrency}, 持续时间=${testConfig.performance.duration}秒`));
    console.log(chalk.gray('='.repeat(60)));
    
    try {
      // 执行所有测试
      const results = await this.testExecutor.executeAll();
      
      // 生成报告数据
      const reportData = this.prepareReportData(results);
      
      // 生成报告
      const reports = await this.reportGenerator.generateAllReports(reportData);
      
      // 显示报告路径
      this.displayReportPaths(reports);
      
      // 清理旧报告
      await this.reportGenerator.cleanupOldReports();
      
      console.log(chalk.green('\n🎉 测试套件执行完成！'));
      
      return {
        success: true,
        results,
        reports
      };
    } catch (error) {
      console.error(chalk.red('\n❌ 测试套件执行失败:'), error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 准备报告数据
   */
  prepareReportData(results) {
    const { unitResults, performanceReport, totalDuration } = results;
    
    // 计算摘要
    const unitSummary = this.testExecutor.unitExecutor.getTestSummary(unitResults);
    const performanceSummary = this.testExecutor.performanceExecutor.getPerformanceSummary(performanceReport);
    
    return {
      testType: 'comprehensive',
      summary: {
        totalTests: unitSummary.totalTests,
        passedTests: unitSummary.passedTests,
        failedTests: unitSummary.failedTests,
        successRate: unitSummary.successRate,
        totalDuration: totalDuration
      },
      details: unitResults,
      performance: performanceSummary,
      recommendations: this.generateRecommendations(unitSummary, performanceSummary)
    };
  }
  
  /**
   * 生成优化建议
   */
  generateRecommendations(unitSummary, performanceSummary) {
    const recommendations = [];
    
    // 基于单元测试的建议
    if (unitSummary.successRate < 100) {
      recommendations.push('修复失败的单元测试用例，提高测试覆盖率');
      recommendations.push('增加边界条件和异常情况的测试用例');
    }
    
    // 基于性能测试的建议
    if (performanceSummary.qps < 50) {
      recommendations.push('优化系统性能，考虑增加服务器资源或优化代码');
      recommendations.push('实施缓存策略，减少重复计算');
    }
    
    if (performanceSummary.averageRT > 1000) {
      recommendations.push('优化数据库查询性能，检查索引使用情况');
      recommendations.push('考虑使用连接池和查询优化');
    }
    
    if (performanceSummary.successRate < 95) {
      recommendations.push('提高系统稳定性，增加错误处理和重试机制');
      recommendations.push('实施监控和告警系统');
    }
    
    if (performanceSummary.p95RT > 2000) {
      recommendations.push('优化慢查询，检查数据库性能瓶颈');
      recommendations.push('考虑读写分离和负载均衡');
    }
    
    return recommendations;
  }
  
  /**
   * 显示报告路径
   */
  displayReportPaths(reports) {
    console.log(chalk.blue('\n📊 测试报告已生成:'));
    
    Object.entries(reports).forEach(([format, path]) => {
      const formatEmoji = {
        json: '📄',
        html: '🌐',
        csv: '📊'
      };
      
      console.log(chalk.cyan(`${formatEmoji[format]} ${format.toUpperCase()}报告: ${path}`));
    });
  }
  
  /**
   * 运行单元测试
   */
  async runUnitTests() {
    console.log(chalk.blue('🧪 运行单元测试...'));
    
    try {
      const results = await this.testExecutor.executeUnitTests();
      const reportData = {
        testType: 'unit',
        summary: this.testExecutor.unitExecutor.getTestSummary(results),
        details: results
      };
      
      const reports = await this.reportGenerator.generateAllReports(reportData);
      this.displayReportPaths(reports);
      
      return { success: true, results, reports };
    } catch (error) {
      console.error(chalk.red('❌ 单元测试失败:'), error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 运行性能测试
   */
  async runPerformanceTests() {
    console.log(chalk.blue('⚡ 运行性能测试...'));
    
    try {
      const results = await this.testExecutor.executePerformanceTests();
      const reportData = {
        testType: 'performance',
        summary: this.testExecutor.performanceExecutor.getPerformanceSummary(results),
        performance: this.testExecutor.performanceExecutor.getPerformanceSummary(results)
      };
      
      const reports = await this.reportGenerator.generateAllReports(reportData);
      this.displayReportPaths(reports);
      
      return { success: true, results, reports };
    } catch (error) {
      console.error(chalk.red('❌ 性能测试失败:'), error);
      return { success: false, error: error.message };
    }
  }
}

// 主执行逻辑
async function main() {
  const testRunner = new TestRunner();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  switch (command) {
    case 'unit':
      await testRunner.runUnitTests();
      break;
    case 'performance':
      await testRunner.runPerformanceTests();
      break;
    case 'all':
    default:
      await testRunner.run();
      break;
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
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ 测试执行失败:'), error);
    process.exit(1);
  });
}

export default TestRunner;
