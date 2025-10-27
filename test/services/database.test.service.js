/**
 * 数据库测试服务
 * 分层架构 - 服务层
 */
import HttpUtil from '../utils/http.util.js';
import { testConfig } from '../config/test.config.js';
import chalk from 'chalk';

export class DatabaseTestService {
  constructor() {
    this.httpUtil = new HttpUtil(testConfig.baseUrl, testConfig.timeout);
    this.testResults = [];
  }
  
  /**
   * 健康检查测试
   */
  async testHealthCheck() {
    console.log(chalk.blue('🏥 测试健康检查接口...'));
    
    try {
      const result = await this.httpUtil.healthCheck();
      
      const testResult = {
        testName: '健康检查',
        endpoint: '/health',
        success: result.success,
        responseTime: result.data?.timestamp ? Date.now() - new Date(result.data.timestamp).getTime() : 0,
        status: result.status,
        data: result.data,
        error: result.error
      };
      
      this.testResults.push(testResult);
      
      if (result.success) {
        console.log(chalk.green('✅ 健康检查通过'));
        console.log(chalk.gray(`   服务状态: ${result.data?.status}`));
        console.log(chalk.gray(`   服务名称: ${result.data?.service}`));
      } else {
        console.log(chalk.red('❌ 健康检查失败'));
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      
      return testResult;
    } catch (error) {
      console.error(chalk.red('❌ 健康检查异常:'), error);
      return { testName: '健康检查', success: false, error: error.message };
    }
  }
  
  /**
   * 集合统计测试
   */
  async testStats() {
    console.log(chalk.blue('📊 测试集合统计接口...'));
    
    try {
      const result = await this.httpUtil.getStats();
      
      const testResult = {
        testName: '集合统计',
        endpoint: '/api/v1/milvus/stats',
        success: result.success,
        responseTime: 0, // 需要从实际响应中计算
        status: result.status,
        data: result.data,
        error: result.error
      };
      
      this.testResults.push(testResult);
      
      if (result.success) {
        console.log(chalk.green('✅ 集合统计获取成功'));
        console.log(chalk.gray(`   行数: ${result.data?.data?.rowCount}`));
      } else {
        console.log(chalk.red('❌ 集合统计获取失败'));
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      
      return testResult;
    } catch (error) {
      console.error(chalk.red('❌ 集合统计异常:'), error);
      return { testName: '集合统计', success: false, error: error.message };
    }
  }
  
  /**
   * 插入向量测试
   */
  async testInsert() {
    console.log(chalk.blue('📥 测试插入向量接口...'));
    
    const rowId = testConfig.testData.sampleRowId;
    const imageInput = testConfig.testData.sampleImageUrl;
    
    try {
      const result = await this.httpUtil.insertVector(rowId, imageInput);
      
      const testResult = {
        testName: '插入向量',
        endpoint: '/api/v1/milvus/insert',
        success: result.success,
        responseTime: 0,
        status: result.status,
        data: result.data,
        error: result.error,
        requestData: { rowId, imageInput }
      };
      
      this.testResults.push(testResult);
      
      if (result.success) {
        console.log(chalk.green('✅ 向量插入成功'));
        console.log(chalk.gray(`   Row ID: ${result.data?.data?.row_id}`));
        console.log(chalk.gray(`   插入数量: ${result.data?.data?.insert_count}`));
      } else {
        console.log(chalk.red('❌ 向量插入失败'));
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      
      return testResult;
    } catch (error) {
      console.error(chalk.red('❌ 向量插入异常:'), error);
      return { testName: '插入向量', success: false, error: error.message };
    }
  }
  
  /**
   * 同步向量测试
   */
  async testSync() {
    console.log(chalk.blue('🔄 测试同步向量接口...'));
    
    const rowId = testConfig.testData.sampleRowId;
    const imageInput = testConfig.testData.sampleImageUrl;
    
    try {
      const result = await this.httpUtil.syncVector(rowId, imageInput);
      
      const testResult = {
        testName: '同步向量',
        endpoint: '/api/v1/milvus/sync',
        success: result.success,
        responseTime: 0,
        status: result.status,
        data: result.data,
        error: result.error,
        requestData: { rowId, imageInput }
      };
      
      this.testResults.push(testResult);
      
      if (result.success) {
        console.log(chalk.green('✅ 向量同步成功'));
        console.log(chalk.gray(`   操作: ${result.data?.action}`));
        console.log(chalk.gray(`   原因: ${result.data?.reason || 'N/A'}`));
      } else {
        console.log(chalk.red('❌ 向量同步失败'));
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      
      return testResult;
    } catch (error) {
      console.error(chalk.red('❌ 向量同步异常:'), error);
      return { testName: '同步向量', success: false, error: error.message };
    }
  }
  
  /**
   * 更新向量测试
   */
  async testUpdate() {
    console.log(chalk.blue('🔄 测试更新向量接口...'));
    
    const rowId = testConfig.testData.sampleRowId;
    const imageInput = testConfig.testData.sampleImageUrl;
    
    try {
      const result = await this.httpUtil.updateVector(rowId, imageInput);
      
      const testResult = {
        testName: '更新向量',
        endpoint: '/api/v1/milvus/update',
        success: result.success,
        responseTime: 0,
        status: result.status,
        data: result.data,
        error: result.error,
        requestData: { rowId, imageInput }
      };
      
      this.testResults.push(testResult);
      
      if (result.success) {
        console.log(chalk.green('✅ 向量更新成功'));
        console.log(chalk.gray(`   Row ID: ${result.data?.data?.row_id}`));
        console.log(chalk.gray(`   更新数量: ${result.data?.data?.upsert_count}`));
      } else {
        console.log(chalk.red('❌ 向量更新失败'));
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      
      return testResult;
    } catch (error) {
      console.error(chalk.red('❌ 向量更新异常:'), error);
      return { testName: '更新向量', success: false, error: error.message };
    }
  }
  
  /**
   * 搜索向量测试
   */
  async testSearch() {
    console.log(chalk.blue('🔍 测试搜索向量接口...'));
    
    const imageInput = testConfig.testData.sampleImageUrl;
    const limit = 20;
    
    try {
      const result = await this.httpUtil.searchVector(imageInput, limit);
      
      const testResult = {
        testName: '搜索向量',
        endpoint: '/api/v1/milvus/search',
        success: result.success,
        responseTime: 0,
        status: result.status,
        data: result.data,
        error: result.error,
        requestData: { imageInput, limit }
      };
      
      this.testResults.push(testResult);
      
      if (result.success) {
        console.log(chalk.green('✅ 向量搜索成功'));
        console.log(chalk.gray(`   结果数量: ${result.data?.data?.length || 0}`));
      } else {
        console.log(chalk.red('❌ 向量搜索失败'));
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      
      return testResult;
    } catch (error) {
      console.error(chalk.red('❌ 向量搜索异常:'), error);
      return { testName: '搜索向量', success: false, error: error.message };
    }
  }
  
  /**
   * 批量删除测试
   */
  async testBatchDelete() {
    console.log(chalk.blue('🗑️ 测试批量删除接口...'));
    
    const rowIds = [testConfig.testData.sampleRowId];
    
    try {
      const result = await this.httpUtil.batchDelete(rowIds);
      
      const testResult = {
        testName: '批量删除',
        endpoint: '/api/v1/milvus/batch-delete',
        success: result.success,
        responseTime: 0,
        status: result.status,
        data: result.data,
        error: result.error,
        requestData: { rowIds }
      };
      
      this.testResults.push(testResult);
      
      if (result.success) {
        console.log(chalk.green('✅ 批量删除成功'));
        console.log(chalk.gray(`   删除数量: ${result.data?.data?.deletedCount}`));
      } else {
        console.log(chalk.red('❌ 批量删除失败'));
        console.log(chalk.red(`   错误: ${result.error}`));
      }
      
      return testResult;
    } catch (error) {
      console.error(chalk.red('❌ 批量删除异常:'), error);
      return { testName: '批量删除', success: false, error: error.message };
    }
  }
  
  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log(chalk.yellow('🚀 开始运行所有API测试...'));
    
    const tests = [
      () => this.testHealthCheck(),
      () => this.testStats(),
      () => this.testInsert(),
      () => this.testSync(),
      () => this.testUpdate(),
      () => this.testSearch(),
      () => this.testBatchDelete()
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
        
        // 测试间隔
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(chalk.red('❌ 测试执行异常:'), error);
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  /**
   * 获取测试结果
   */
  getTestResults() {
    return this.testResults;
  }
  
  /**
   * 清空测试结果
   */
  clearResults() {
    this.testResults = [];
  }
}

export default DatabaseTestService;
