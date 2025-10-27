/**
 * 单元测试执行器
 * 分层架构 - 执行层
 */
import DatabaseTestService from '../services/database.test.service.js';
import chalk from 'chalk';
import moment from 'moment';

export class UnitTestExecutor {
  constructor() {
    this.testService = new DatabaseTestService();
    this.startTime = null;
    this.endTime = null;
  }
  
  /**
   * 执行单元测试
   */
  async execute() {
    console.log(chalk.blue('🧪 开始执行单元测试...'));
    console.log(chalk.gray(`测试时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`));
    console.log(chalk.gray('='.repeat(50)));
    
    this.startTime = Date.now();
    
    try {
      // 运行所有测试
      const results = await this.testService.runAllTests();
      
      this.endTime = Date.now();
      const duration = this.endTime - this.startTime;
      
      // 生成测试报告
      this.generateReport(results, duration);
      
      return results;
    } catch (error) {
      console.error(chalk.red('❌ 单元测试执行失败:'), error);
      throw error;
    }
  }
  
  /**
   * 生成测试报告
   */
  generateReport(results, duration) {
    console.log(chalk.gray('='.repeat(50)));
    console.log(chalk.yellow('📊 单元测试报告'));
    console.log(chalk.gray('='.repeat(50)));
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    console.log(chalk.blue(`总测试数: ${totalTests}`));
    console.log(chalk.green(`通过: ${passedTests}`));
    console.log(chalk.red(`失败: ${failedTests}`));
    console.log(chalk.yellow(`成功率: ${successRate}%`));
    console.log(chalk.cyan(`执行时间: ${duration}ms`));
    
    console.log(chalk.gray('\n📋 详细结果:'));
    results.forEach((result, index) => {
      const status = result.success ? chalk.green('✅') : chalk.red('❌');
      const testName = result.testName || `测试${index + 1}`;
      const endpoint = result.endpoint || 'N/A';
      
      console.log(`${status} ${testName}`);
      console.log(chalk.gray(`   端点: ${endpoint}`));
      
      if (result.success) {
        console.log(chalk.gray(`   状态码: ${result.status}`));
        if (result.data) {
          console.log(chalk.gray(`   响应数据: ${JSON.stringify(result.data).substring(0, 100)}...`));
        }
      } else {
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      console.log('');
    });
    
    // 性能分析
    this.analyzePerformance(results);
  }
  
  /**
   * 性能分析
   */
  analyzePerformance(results) {
    console.log(chalk.yellow('\n⚡ 性能分析:'));
    
    const responseTimes = results
      .filter(r => r.responseTime > 0)
      .map(r => r.responseTime);
    
    if (responseTimes.length > 0) {
      const avgRT = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
      const maxRT = Math.max(...responseTimes);
      const minRT = Math.min(...responseTimes);
      
      console.log(chalk.cyan(`平均响应时间: ${avgRT.toFixed(2)}ms`));
      console.log(chalk.cyan(`最大响应时间: ${maxRT.toFixed(2)}ms`));
      console.log(chalk.cyan(`最小响应时间: ${minRT.toFixed(2)}ms`));
      
      // 性能警告
      const warningThreshold = 1000;
      const criticalThreshold = 3000;
      
      const slowTests = results.filter(r => r.responseTime > warningThreshold);
      if (slowTests.length > 0) {
        console.log(chalk.yellow(`⚠️  慢响应测试 (${slowTests.length}个):`));
        slowTests.forEach(test => {
          console.log(chalk.yellow(`   ${test.testName}: ${test.responseTime.toFixed(2)}ms`));
        });
      }
      
      const criticalTests = results.filter(r => r.responseTime > criticalThreshold);
      if (criticalTests.length > 0) {
        console.log(chalk.red(`🚨 严重慢响应测试 (${criticalTests.length}个):`));
        criticalTests.forEach(test => {
          console.log(chalk.red(`   ${test.testName}: ${test.responseTime.toFixed(2)}ms`));
        });
      }
    }
  }
  
  /**
   * 获取测试摘要
   */
  getTestSummary(results) {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      duration: this.endTime - this.startTime,
      timestamp: new Date().toISOString()
    };
  }
}

export default UnitTestExecutor;

// 主执行逻辑
async function main() {
  const executor = new UnitTestExecutor();
  
  try {
    console.log(chalk.blue('🚀 单元测试执行器启动'));
    const results = await executor.execute();
    
    // 生成报告
    console.log(chalk.yellow('📊 生成测试报告...'));
    const { ReportGenerator } = await import('../reports/report.generator.js');
    const reportGenerator = new ReportGenerator();
    
    const reportData = {
      testType: 'unit',
      summary: executor.getTestSummary(results),
      details: results
    };
    
    const reports = await reportGenerator.generateAllReports(reportData);
    
    // 显示报告路径
    console.log(chalk.blue('📊 测试报告已生成:'));
    Object.entries(reports).forEach(([format, path]) => {
      const formatEmoji = {
        json: '📄',
        html: '🌐',
        csv: '📊'
      };
      console.log(chalk.cyan(`${formatEmoji[format]} ${format.toUpperCase()}报告: ${path}`));
    });
    
    console.log(chalk.green('🎉 单元测试执行完成'));
    return results;
  } catch (error) {
    console.error(chalk.red('❌ 单元测试执行失败:'), error);
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
