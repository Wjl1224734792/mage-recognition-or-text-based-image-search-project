/**
 * 测试报告生成器
 * 分层架构 - 报告层
 */
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import chalk from 'chalk';
import { testConfig } from '../config/test.config.js';

export class ReportGenerator {
  constructor() {
    this.outputDir = testConfig.reports.outputDir;
    this.timestamp = moment().format('YYYY-MM-DDTHH-mm-ss-SSS[Z]');
  }
  
  /**
   * 生成JSON报告
   */
  async generateJsonReport(data, filename = null) {
    const reportFilename = filename || `test-report-${this.timestamp}.json`;
    const reportPath = path.join(this.outputDir, reportFilename);
    
    await fs.ensureDir(this.outputDir);
    
    const report = {
      metadata: {
        timestamp: this.timestamp,
        testType: data.testType || 'comprehensive',
        version: '1.0.0',
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      },
      summary: data.summary || {},
      details: data.details || {},
      performance: data.performance || {},
      recommendations: data.recommendations || []
    };
    
    await fs.writeJson(reportPath, report, { spaces: 2 });
    console.log(chalk.green(`📄 JSON报告已生成: ${reportPath}`));
    
    return reportPath;
  }
  
  /**
   * 生成HTML报告
   */
  async generateHtmlReport(data, filename = null) {
    const reportFilename = filename || `test-report-${this.timestamp}.html`;
    const reportPath = path.join(this.outputDir, reportFilename);
    
    await fs.ensureDir(this.outputDir);
    
    const html = this.generateHtmlContent(data);
    await fs.writeFile(reportPath, html, 'utf8');
    console.log(chalk.green(`🌐 HTML报告已生成: ${reportPath}`));
    
    return reportPath;
  }
  
  /**
   * 生成CSV报告
   */
  async generateCsvReport(data, filename = null) {
    const reportFilename = filename || `test-report-${this.timestamp}.csv`;
    const reportPath = path.join(this.outputDir, reportFilename);
    
    await fs.ensureDir(this.outputDir);
    
    const csv = this.generateCsvContent(data);
    await fs.writeFile(reportPath, csv, 'utf8');
    console.log(chalk.green(`📊 CSV报告已生成: ${reportPath}`));
    
    return reportPath;
  }
  
  /**
   * 生成HTML内容
   */
  generateHtmlContent(data) {
    const { summary, details, performance } = data;
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Milvus API 测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .header .timestamp { color: #666; font-size: 14px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .metric-label { color: #666; font-size: 14px; margin-top: 5px; }
        .success { color: #27ae60; }
        .warning { color: #f39c12; }
        .error { color: #e74c3c; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .test-pass { background: #d5f4e6; border-left: 4px solid #27ae60; }
        .test-fail { background: #fadbd8; border-left: 4px solid #e74c3c; }
        .performance-chart { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; }
        .recommendations ul { margin: 10px 0; padding-left: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-pass { color: #27ae60; font-weight: bold; }
        .status-fail { color: #e74c3c; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Milvus API 测试报告</h1>
            <div class="timestamp">生成时间: ${this.timestamp}</div>
        </div>
        
        <div class="section">
            <h2>📊 测试概览</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${summary.totalTests || 0}</div>
                    <div class="metric-label">总测试数</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value success">${summary.passedTests || 0}</div>
                    <div class="metric-label">通过测试</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value error">${summary.failedTests || 0}</div>
                    <div class="metric-label">失败测试</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.successRate || 0}%</div>
                    <div class="metric-label">成功率</div>
                </div>
            </div>
        </div>
        
        ${performance ? `
        <div class="section">
            <h2>⚡ 性能指标</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${performance.qps?.toFixed(2) || 0}</div>
                    <div class="metric-label">QPS (每秒查询数)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${performance.tps?.toFixed(2) || 0}</div>
                    <div class="metric-label">TPS (每秒事务数)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${performance.averageRT?.toFixed(2) || 0}ms</div>
                    <div class="metric-label">平均响应时间</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${performance.successRate?.toFixed(2) || 0}%</div>
                    <div class="metric-label">成功率</div>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="section">
            <h2>📋 详细测试结果</h2>
            ${this.generateTestResultsHtml(details)}
        </div>
        
        <div class="section">
            <h2>💡 优化建议</h2>
            <div class="recommendations">
                ${this.generateRecommendationsHtml(data.recommendations || [])}
            </div>
        </div>
    </div>
</body>
</html>`;
  }
  
  /**
   * 生成测试结果HTML
   */
  generateTestResultsHtml(details) {
    if (!details || !Array.isArray(details)) {
      return '<p>暂无详细测试结果</p>';
    }
    
    return `
    <table>
        <thead>
            <tr>
                <th>测试名称</th>
                <th>状态</th>
                <th>响应时间</th>
                <th>端点</th>
                <th>错误信息</th>
            </tr>
        </thead>
        <tbody>
            ${details.map(test => `
            <tr>
                <td>${test.testName || 'N/A'}</td>
                <td class="${test.success ? 'status-pass' : 'status-fail'}">
                    ${test.success ? '✅ 通过' : '❌ 失败'}
                </td>
                <td>${test.responseTime ? test.responseTime.toFixed(2) + 'ms' : 'N/A'}</td>
                <td>${test.endpoint || 'N/A'}</td>
                <td>${test.error || 'N/A'}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>`;
  }
  
  /**
   * 生成建议HTML
   */
  generateRecommendationsHtml(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return '<p>🎉 系统表现优秀，无需特别优化</p>';
    }
    
    return `
    <ul>
        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>`;
  }
  
  /**
   * 生成CSV内容
   */
  generateCsvContent(data) {
    const { summary, details, performance } = data;
    
    let csv = '测试类型,指标,值\n';
    
    // 添加摘要数据
    csv += `概览,总测试数,${summary.totalTests || 0}\n`;
    csv += `概览,通过测试,${summary.passedTests || 0}\n`;
    csv += `概览,失败测试,${summary.failedTests || 0}\n`;
    csv += `概览,成功率,${summary.successRate || 0}%\n`;
    
    // 添加性能数据
    if (performance) {
      csv += `性能,QPS,${performance.qps?.toFixed(2) || 0}\n`;
      csv += `性能,TPS,${performance.tps?.toFixed(2) || 0}\n`;
      csv += `性能,平均响应时间,${performance.averageRT?.toFixed(2) || 0}\n`;
      csv += `性能,P95响应时间,${performance.p95RT?.toFixed(2) || 0}\n`;
      csv += `性能,P99响应时间,${performance.p99RT?.toFixed(2) || 0}\n`;
      csv += `性能,错误率,${performance.errorRate?.toFixed(2) || 0}%\n`;
      csv += `性能,成功率,${performance.successRate?.toFixed(2) || 0}%\n`;
    }
    
    // 添加详细测试结果
    if (details && Array.isArray(details)) {
      csv += '\n测试名称,状态,响应时间,端点,错误信息\n';
      details.forEach(test => {
        csv += `${test.testName || 'N/A'},${test.success ? '通过' : '失败'},${test.responseTime || 0},${test.endpoint || 'N/A'},${test.error || 'N/A'}\n`;
      });
    }
    
    return csv;
  }
  
  /**
   * 生成所有格式的报告
   */
  async generateAllReports(data) {
    console.log(chalk.blue('📊 开始生成测试报告...'));
    
    const reports = {};
    
    try {
      // 生成JSON报告
      if (testConfig.reports.formats.includes('json')) {
        reports.json = await this.generateJsonReport(data);
      }
      
      // 生成HTML报告
      if (testConfig.reports.formats.includes('html')) {
        reports.html = await this.generateHtmlReport(data);
      }
      
      // 生成CSV报告
      if (testConfig.reports.formats.includes('csv')) {
        reports.csv = await this.generateCsvReport(data);
      }
      
      console.log(chalk.green('✅ 所有报告生成完成'));
      return reports;
    } catch (error) {
      console.error(chalk.red('❌ 报告生成失败:'), error);
      throw error;
    }
  }
  
  /**
   * 清理旧报告
   */
  async cleanupOldReports(daysToKeep = 7) {
    try {
      const files = await fs.readdir(this.outputDir);
      const cutoffDate = moment().subtract(daysToKeep, 'days');
      
      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.stat(filePath);
        
        if (moment(stats.mtime).isBefore(cutoffDate)) {
          await fs.remove(filePath);
          console.log(chalk.yellow(`🗑️  删除旧报告: ${file}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ 清理旧报告失败:'), error);
    }
  }
}

export default ReportGenerator;
