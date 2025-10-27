/**
 * 基础测试 - 验证API连接
 */
import axios from 'axios';
import chalk from 'chalk';

console.log(chalk.blue('🚀 基础API连接测试'));

const baseUrl = 'http://localhost:3001';

async function testHealthCheck() {
  try {
    console.log(chalk.yellow('🏥 测试健康检查接口...'));
    const response = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log(chalk.green('✅ 健康检查成功'));
      console.log(chalk.gray(`   状态: ${response.data.status}`));
      console.log(chalk.gray(`   服务: ${response.data.service}`));
      return true;
    } else {
      console.log(chalk.red('❌ 健康检查失败'));
      return false;
    }
  } catch (error) {
    console.log(chalk.red('❌ 健康检查异常:'));
    console.log(chalk.red(`   错误: ${error.message}`));
    
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.yellow('💡 建议: 请确保后端服务已启动 (http://localhost:3001)'));
    }
    
    return false;
  }
}

async function testStats() {
  try {
    console.log(chalk.yellow('📊 测试集合统计接口...'));
    const response = await axios.get(`${baseUrl}/api/v1/milvus/stats`, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log(chalk.green('✅ 集合统计成功'));
      console.log(chalk.gray(`   行数: ${response.data.data?.rowCount || 0}`));
      return true;
    } else {
      console.log(chalk.red('❌ 集合统计失败'));
      return false;
    }
  } catch (error) {
    console.log(chalk.red('❌ 集合统计异常:'));
    console.log(chalk.red(`   错误: ${error.message}`));
    return false;
  }
}

async function main() {
  console.log(chalk.blue('🧪 开始基础API测试...'));
  console.log(chalk.gray(`测试目标: ${baseUrl}`));
  console.log(chalk.gray('='.repeat(50)));
  
  const healthResult = await testHealthCheck();
  const statsResult = await testStats();
  
  console.log(chalk.gray('='.repeat(50)));
  
  if (healthResult && statsResult) {
    console.log(chalk.green('🎉 基础测试全部通过！'));
    console.log(chalk.cyan('💡 现在可以运行完整的测试套件了'));
  } else {
    console.log(chalk.red('❌ 基础测试失败'));
    console.log(chalk.yellow('💡 请检查后端服务是否正常运行'));
  }
}

main().catch(error => {
  console.error(chalk.red('❌ 测试执行失败:'), error);
  process.exit(1);
});
