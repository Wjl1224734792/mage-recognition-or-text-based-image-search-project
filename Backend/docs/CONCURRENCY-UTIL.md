# 并发控制工具文档

基于 Promise 的现代化并发控制工具，提供任务队列管理、并发限制、错误处理、重试机制等功能。

## 🚀 特性

- ✅ **任务队列管理** - 支持优先级排序的任务队列
- ✅ **并发控制** - 可配置的最大并发数量
- ✅ **错误处理** - 完善的错误捕获和处理机制
- ✅ **重试机制** - 支持自动重试和自定义重试策略
- ✅ **任务取消** - 支持任务中止和取消
- ✅ **事件系统** - 完整的事件监听和通知
- ✅ **统计信息** - 详细的执行统计和性能监控
- ✅ **工具函数** - 便捷的并发处理工具函数

## 📦 安装

```bash
# 无需额外安装，基于原生 Promise API
# 项目使用 yarn 作为包管理器
```

## 🔧 基础使用

### 导入工具

```javascript
import concurrencyController, { ConcurrencyController, ConcurrencyUtils } from './utils/concurrency.util.js';

// 使用默认实例
const result = await concurrencyController.addTask({
  id: 'my-task',
  task: async () => '任务完成'
});

// 或创建自定义实例
const controller = new ConcurrencyController({
  maxConcurrency: 5,
  maxQueueSize: 100
});
```

### 基础任务管理

```javascript
// 创建控制器
const controller = new ConcurrencyController({
  maxConcurrency: 3,    // 最大并发数
  maxQueueSize: 100,    // 队列最大容量
  retryDelay: 1000,     // 重试延迟
  defaultTimeout: 30000 // 默认超时时间
});

// 启动控制器
controller.start();

// 添加任务
const result = await controller.addTask({
  id: 'task-1',
  task: async (data) => {
    // 执行异步任务
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `处理结果: ${data}`;
  },
  data: '任务数据',
  priority: 5,          // 优先级（数字越大优先级越高）
  retries: 2,           // 重试次数
  timeout: 5000         // 任务超时时间
});

console.log(result.data); // 处理结果: 任务数据

// 停止控制器
controller.stop();
```

## 🎯 高级功能

### 任务优先级

```javascript
// 高优先级任务会优先执行
const highPriorityTask = controller.addTask({
  id: 'urgent-task',
  task: async () => '紧急任务完成',
  priority: 10  // 高优先级
});

const normalTask = controller.addTask({
  id: 'normal-task', 
  task: async () => '普通任务完成',
  priority: 0   // 普通优先级
});

// 高优先级任务会先执行
```

### 错误处理和重试

```javascript
const result = await controller.addTask({
  id: 'retry-task',
  task: async (data, signal) => {
    // 检查中止信号
    if (signal.aborted) {
      throw new Error('任务被中止');
    }
    
    // 模拟可能失败的操作
    if (Math.random() < 0.5) {
      throw new Error('网络错误');
    }
    
    return '任务成功';
  },
  retries: 3,           // 最多重试3次
  retryDelay: 1000,      // 重试间隔1秒
  timeout: 5000,        // 5秒超时
  onSuccess: (result) => console.log('任务成功:', result.data),
  onError: (result) => console.log('任务失败:', result.error.message),
  onComplete: (result) => console.log('任务完成:', result.success)
});
```

### 任务取消

```javascript
// 添加长时间运行的任务
const longTask = controller.addTask({
  id: 'long-task',
  task: async (data, signal) => {
    for (let i = 0; i < 100; i++) {
      if (signal.aborted) {
        throw new Error('任务被取消');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return '长时间任务完成';
  }
});

// 取消任务
setTimeout(() => {
  const cancelled = controller.cancelTask('long-task');
  console.log('任务取消结果:', cancelled);
}, 1000);
```

### 事件监听

```javascript
// 添加事件监听器
controller.on('started', () => console.log('控制器已启动'));
controller.on('paused', () => console.log('控制器已暂停'));
controller.on('resumed', () => console.log('控制器已恢复'));
controller.on('stopped', () => console.log('控制器已停止'));

controller.on('taskAdded', (task) => {
  console.log(`任务已添加: ${task.id}`);
});

controller.on('taskCompleted', (result) => {
  console.log(`任务完成: ${result.id}, 耗时: ${result.duration}ms`);
});

controller.on('taskFailed', (result) => {
  console.log(`任务失败: ${result.id}, 错误: ${result.error.message}`);
});

// 移除事件监听器
controller.off('taskCompleted', listenerFunction);
```

## 🔧 工具函数

### 并发限制

```javascript
// 限制并发数量的任务执行
const tasks = Array.from({ length: 10 }, (_, i) => 
  () => fetch(`/api/data/${i}`)
);

const results = await ConcurrencyUtils.limitConcurrency(tasks, 3);
console.log('完成的任务数:', results.length);
```

### 批量处理

```javascript
// 批量处理数据
const data = Array.from({ length: 100 }, (_, i) => ({ id: i, value: i * 10 }));

const processedData = await ConcurrencyUtils.batchProcess(
  data,
  async (item) => {
    // 处理单个数据项
    await new Promise(resolve => setTimeout(resolve, 100));
    return { ...item, processed: true };
  },
  10, // 批次大小
  3   // 并发数量
);

console.log('处理完成:', processedData.length);
```

### 任务池

```javascript
// 创建任务池
const taskPool = ConcurrencyUtils.createTaskPool(5);

// 使用任务池执行任务
const results = await Promise.all([
  taskPool.execute(async () => '任务1'),
  taskPool.execute(async () => '任务2'),
  taskPool.execute(async () => '任务3')
]);

console.log('任务池结果:', results);
```

## 📊 监控和统计

### 获取统计信息

```javascript
const stats = controller.getStats();
console.log('统计信息:', {
  总任务数: stats.totalTasks,
  完成任务数: stats.completedTasks,
  失败任务数: stats.failedTasks,
  重试次数: stats.retriedTasks,
  成功率: stats.successRate,
  队列大小: stats.queueSize,
  运行中任务: stats.runningTasks,
  执行时长: stats.duration
});
```

### 任务状态查询

```javascript
// 查询任务状态
const status = controller.getTaskStatus('task-1');
console.log('任务状态:', status);
// 可能的状态: 'queued', 'running', 'completed'
```

## 🎛️ 控制器管理

### 启动和停止

```javascript
// 启动控制器
controller.start();

// 暂停控制器
controller.pause();

// 恢复控制器
controller.resume();

// 停止控制器
controller.stop();
```

### 队列管理

```javascript
// 清空队列
controller.clearQueue();

// 获取队列大小
const queueSize = controller.getStats().queueSize;
```

## 🧪 测试

### 运行测试

```bash
# 运行并发工具测试
yarn test-concurrency-util

# 运行使用示例
yarn example-concurrency-usage
```

### 测试覆盖

- ✅ 基础功能测试
- ✅ 并发控制测试
- ✅ 任务优先级测试
- ✅ 重试机制测试
- ✅ 任务取消测试
- ✅ 工具函数测试
- ✅ 事件系统测试
- ✅ 错误处理测试

## 📈 性能优化

### 最佳实践

1. **合理设置并发数** - 根据系统资源调整 `maxConcurrency`
2. **使用优先级** - 重要任务设置高优先级
3. **设置超时** - 避免任务无限等待
4. **监控统计** - 定期检查执行统计
5. **错误处理** - 合理设置重试次数

### 性能指标

- **吞吐量**: 每秒处理的任务数
- **成功率**: 任务执行成功率
- **平均耗时**: 任务平均执行时间
- **队列延迟**: 任务在队列中的等待时间

## 🔍 故障排除

### 常见问题

1. **任务超时**
   ```javascript
   // 增加超时时间
   controller.addTask({
     id: 'long-task',
     task: async () => { /* 长时间任务 */ },
     timeout: 60000 // 60秒
   });
   ```

2. **队列满载**
   ```javascript
   // 增加队列容量
   const controller = new ConcurrencyController({
     maxQueueSize: 1000
   });
   ```

3. **内存泄漏**
   ```javascript
   // 定期清理已完成的任务
   setInterval(() => {
     controller.clearQueue();
   }, 300000); // 5分钟清理一次
   ```

## 📚 API 参考

### ConcurrencyController

#### 构造函数选项

```typescript
interface ControllerOptions {
  maxConcurrency?: number;    // 最大并发数，默认 5
  maxQueueSize?: number;     // 队列最大容量，默认 1000
  retryDelay?: number;       // 重试延迟，默认 1000ms
  defaultTimeout?: number;   // 默认超时时间，默认 30000ms
}
```

#### 主要方法

- `addTask(config)` - 添加任务
- `addTasks(configs)` - 批量添加任务
- `start()` - 启动控制器
- `pause()` - 暂停控制器
- `resume()` - 恢复控制器
- `stop()` - 停止控制器
- `cancelTask(id)` - 取消任务
- `clearQueue()` - 清空队列
- `getTaskStatus(id)` - 获取任务状态
- `getStats()` - 获取统计信息
- `on(event, listener)` - 添加事件监听器
- `off(event, listener)` - 移除事件监听器

### ConcurrencyUtils

#### 静态方法

- `limitConcurrency(tasks, concurrency)` - 限制并发数量
- `batchProcess(data, processor, batchSize, concurrency)` - 批量处理
- `createTaskPool(poolSize)` - 创建任务池

## 🎉 总结

并发控制工具提供了完整的任务管理解决方案，支持：

- **灵活配置** - 可自定义并发数、队列大小等参数
- **优先级管理** - 支持任务优先级排序
- **错误处理** - 完善的错误捕获和重试机制
- **性能监控** - 详细的统计信息和性能指标
- **事件系统** - 完整的事件监听和通知机制
- **工具函数** - 便捷的并发处理工具

适用于需要控制并发数量的各种场景，如 API 调用、文件处理、数据批量操作等。
