/**
 * 综合测试执行器
 * 分层架构 - 执行层
 */
import UnitTestExecutor from './unit.executor.js';
import PerformanceTestExecutor from './performance.executor.js';
import chalk from 'chalk';
import moment from 'moment';

export class TestExecutor {
  constructor() {
    this.unitExecutor = new UnitTestExecutor();
    this.performanceExecutor = new PerformanceTestExecutor();
    this.startTime = null;
    this.endTime = null;
  }
  
  /**
   * 执行所有测试
   */
  async executeAll() {
    console.log(chalk.blue('🚀 开始执行综合测试套件...'));
    console.log(chalk.gray(`测试时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`));
    console.log(chalk.gray('='.repeat(60)));
    
    this.startTime = Date.now();
    
    try {
      // 1. 执行单元测试
      console.log(chalk.yellow('\n📋 第一阶段: 单元测试'));
      console.log(chalk.gray('-' * 40));
      const unitResults = await this.unitExecutor.execute();
      
      // 2. 执行性能测试
      console.log(chalk.yellow('\n⚡ 第二阶段: 性能测试'));
      console.log(chalk.gray('-' * 40));
      const performanceReport = await this.performanceExecutor.execute();
      
      this.endTime = Date.now();
      const totalDuration = this.endTime - this.startTime;
      
      // 3. 生成综合报告
      this.generateComprehensiveReport(unitResults, performanceReport, totalDuration);
      
      return {
        unitResults,
        performanceReport,
        totalDuration
      };
    } catch (error) {
      console.error(chalk.red('❌ 综合测试执行失败:'), error);
      throw error;
    }
  }
  
  /**
   * 执行单元测试
   */
  async executeUnitTests() {
    console.log(chalk.blue('🧪 执行单元测试...'));
    return await this.unitExecutor.execute();
  }
  
  /**
   * 执行性能测试
   */
  async executePerformanceTests() {
    console.log(chalk.blue('⚡ 执行性能测试...'));
    return await this.performanceExecutor.execute();
  }
  
  /**
   * 生成综合报告
   */
  generateComprehensiveReport(unitResults, performanceReport, totalDuration) {
    console.log(chalk.gray('\n' + '='.repeat(60)));
    console.log(chalk.yellow('📊 综合测试报告'));
    console.log(chalk.gray('='.repeat(60)));
    
    // 测试概览
    console.log(chalk.blue('📈 测试概览:'));
    console.log(chalk.cyan(`总执行时间: ${totalDuration}ms`));
    console.log(chalk.cyan(`测试完成时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}`));
    
    // 单元测试摘要
    const unitSummary = this.unitExecutor.getTestSummary(unitResults);
    console.log(chalk.blue('\n🧪 单元测试摘要:'));
    console.log(chalk.cyan(`总测试数: ${unitSummary.totalTests}`));
    console.log(chalk.green(`通过: ${unitSummary.passedTests}`));
    console.log(chalk.red(`失败: ${unitSummary.failedTests}`));
    console.log(chalk.yellow(`成功率: ${unitSummary.successRate}%`));
    
    // 性能测试摘要
    const performanceSummary = this.performanceExecutor.getPerformanceSummary(performanceReport);
    console.log(chalk.blue('\n⚡ 性能测试摘要:'));
    console.log(chalk.cyan(`总请求数: ${performanceSummary.totalRequests}`));
    console.log(chalk.cyan(`成功请求数: ${performanceSummary.successfulRequests}`));
    console.log(chalk.cyan(`失败请求数: ${performanceSummary.failedRequests}`));
    console.log(chalk.green(`QPS: ${performanceSummary.qps.toFixed(2)}`));
    console.log(chalk.green(`TPS: ${performanceSummary.tps.toFixed(2)}`));
    console.log(chalk.green(`平均响应时间: ${performanceSummary.averageRT.toFixed(2)}ms`));
    console.log(chalk.green(`成功率: ${performanceSummary.successRate.toFixed(2)}%`));
    
    // 整体评估
    this.evaluateOverallResults(unitSummary, performanceSummary);
    
    // 生成建议
    this.generateOverallRecommendations(unitSummary, performanceSummary);
  }
  
  /**
   * 整体结果评估
   */
  evaluateOverallResults(unitSummary, performanceSummary) {
    console.log(chalk.blue('\n🎯 整体评估:'));
    
    let overallScore = 0;
    let maxScore = 0;
    
    // 单元测试评分 (40%)
    const unitScore = (unitSummary.successRate / 100) * 40;
    overallScore += unitScore;
    maxScore += 40;
    
    console.log(chalk.cyan(`单元测试得分: ${unitScore.toFixed(1)}/40`));
    
    // 性能测试评分 (60%)
    let performanceScore = 0;
    
    // QPS评分 (20%)
    const qpsScore = Math.min(performanceSummary.qps / 100 * 20, 20);
    performanceScore += qpsScore;
    
    // 响应时间评分 (20%)
    const rtScore = Math.max(0, 20 - (performanceSummary.averageRT / 1000) * 20);
    performanceScore += rtScore;
    
    // 成功率评分 (20%)
    const successScore = (performanceSummary.successRate / 100) * 20;
    performanceScore += successScore;
    
    overallScore += performanceScore;
    maxScore += 60;
    
    console.log(chalk.cyan(`性能测试得分: ${performanceScore.toFixed(1)}/60`));
    console.log(chalk.cyan(`  - QPS得分: ${qpsScore.toFixed(1)}/20`));
    console.log(chalk.cyan(`  - 响应时间得分: ${rtScore.toFixed(1)}/20`));
    console.log(chalk.cyan(`  - 成功率得分: ${successScore.toFixed(1)}/20`));
    
    // 总分
    const finalScore = (overallScore / maxScore) * 100;
    console.log(chalk.yellow(`\n🏆 总分: ${finalScore.toFixed(1)}/100`));
    
    // 等级评定
    if (finalScore >= 90) {
      console.log(chalk.green('🌟 优秀 (A级)'));
    } else if (finalScore >= 80) {
      console.log(chalk.yellow('⭐ 良好 (B级)'));
    } else if (finalScore >= 70) {
      console.log(chalk.orange('⚠️  一般 (C级)'));
    } else {
      console.log(chalk.red('❌ 需要改进 (D级)'));
    }
  }
  
  /**
   * 生成整体建议
   */
  generateOverallRecommendations(unitSummary, performanceSummary) {
    console.log(chalk.blue('\n💡 优化建议:'));
    
    const recommendations = [];
    
    // 基于单元测试的建议
    if (unitSummary.successRate < 100) {
      recommendations.push('修复失败的单元测试用例');
      recommendations.push('增加错误处理和异常情况测试');
    }
    
    // 基于性能测试的建议
    if (performanceSummary.qps < 50) {
      recommendations.push('优化系统性能，提高QPS');
      recommendations.push('考虑增加服务器资源');
    }
    
    if (performanceSummary.averageRT > 1000) {
      recommendations.push('优化响应时间');
      recommendations.push('检查数据库查询性能');
    }
    
    if (performanceSummary.successRate < 95) {
      recommendations.push('提高系统稳定性');
      recommendations.push('增加错误监控和告警');
    }
    
    if (recommendations.length === 0) {
      console.log(chalk.green('🎉 系统表现优秀，无需特别优化'));
    } else {
      recommendations.forEach((rec, index) => {
        console.log(chalk.yellow(`${index + 1}. ${rec}`));
      });
    }
  }
  
  /**
   * 获取测试摘要
   */
  getTestSummary(unitResults, performanceReport) {
    const unitSummary = this.unitExecutor.getTestSummary(unitResults);
    const performanceSummary = this.performanceExecutor.getPerformanceSummary(performanceReport);
    
    return {
      unit: unitSummary,
      performance: performanceSummary,
      totalDuration: this.endTime - this.startTime,
      timestamp: new Date().toISOString()
    };
  }
}

export default TestExecutor;
