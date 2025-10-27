# HTTP 请求工具文档

基于 fetch API 封装的现代化 HTTP 请求工具，支持拦截器、重试、超时、取消等功能。

## 🚀 特性

- ✅ **基于 fetch API** - 现代化的网络请求
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **请求/响应拦截器** - 灵活的请求处理
- ✅ **自动重试机制** - 网络异常自动重试
- ✅ **请求超时控制** - 防止请求无限等待
- ✅ **请求取消功能** - 支持取消单个或所有请求
- ✅ **文件上传/下载** - 便捷的文件处理
- ✅ **并发请求支持** - 高效的批量请求
- ✅ **错误处理** - 完善的错误拦截和处理

## 📦 安装

```bash
# 无需额外安装，基于原生 fetch API
# 项目使用 yarn 作为包管理器
```

## 🔧 基础使用

### 导入工具

```javascript
import httpClient, { HttpClient } from './utils/http.util.js';

// 使用默认实例
const response = await httpClient.get('https://api.example.com/data');

// 或创建自定义实例
const customClient = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
});
```

### 基础请求方法

```javascript
// GET 请求
const getResponse = await httpClient.get('/users');

// POST 请求
const postResponse = await httpClient.post('/users', {
  name: '张三',
  email: 'zhangsan@example.com'
});

// PUT 请求
const putResponse = await httpClient.put('/users/1', {
  name: '李四'
});

// PATCH 请求
const patchResponse = await httpClient.patch('/users/1', {
  email: 'lisi@example.com'
});

// DELETE 请求
const deleteResponse = await httpClient.delete('/users/1');
```

## ⚙️ 高级配置

### 创建自定义客户端

```javascript
const client = new HttpClient({
  baseURL: 'https://api.example.com',    // 基础URL
  timeout: 10000,                        // 超时时间(ms)
  retries: 3,                           // 重试次数
  retryDelay: 1000,                     // 重试延迟(ms)
  withCredentials: true,                // 携带凭证
  headers: {                            // 默认请求头
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  }
});
```

### 请求配置选项

```javascript
const response = await client.request({
  url: '/api/data',
  method: 'POST',
  headers: {
    'Custom-Header': 'value'
  },
  data: { key: 'value' },
  timeout: 5000,
  retries: 2,
  retryDelay: 1000,
  withCredentials: true,
  responseType: 'json'  // json, text, blob, arrayBuffer
});
```

## 🔄 拦截器

### 请求拦截器

```javascript
client.addRequestInterceptor((config) => {
  // 添加认证头
  config.headers.Authorization = `Bearer ${getToken()}`;
  
  // 记录请求日志
  console.log('发送请求:', config.url);
  
  return config;
});
```

### 响应拦截器

```javascript
client.addResponseInterceptor((response) => {
  // 处理响应数据
  if (response.data.code === 0) {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
});
```

### 错误拦截器

```javascript
client.addErrorInterceptor((error) => {
  // 统一错误处理
  console.error('请求错误:', error.message);
  
  // 可以重新抛出或返回处理后的错误
  return error;
});
```

## ⏰ 超时和取消

### 请求超时

```javascript
// 设置请求超时
const response = await client.get('/api/data', {
  timeout: 5000  // 5秒超时
});
```

### 请求取消

```javascript
// 取消单个请求
const requestId = 'unique-request-id';
const controller = client.createAbortController(requestId);

// 取消请求
client.cancelRequest(requestId);

// 取消所有请求
client.cancelAllRequests();
```

## 🔄 重试机制

```javascript
const response = await client.get('/api/data', {
  retries: 3,        // 重试3次
  retryDelay: 1000   // 每次重试间隔1秒
});
```

## 📁 文件处理

### 文件上传

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', '文件描述');

const response = await client.upload('/api/upload', formData);
```

### 文件下载

```javascript
const response = await client.download('/api/download/file.pdf');

// 处理下载的文件
const blob = response.data;
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'file.pdf';
a.click();
```

## ⚡ 并发请求

```javascript
// 并发发送多个请求
const promises = [
  client.get('/api/users'),
  client.get('/api/posts'),
  client.get('/api/comments')
];

const [users, posts, comments] = await Promise.all(promises);
```

## 🧪 测试

### 运行测试

```bash
# 运行HTTP工具测试
yarn test-http-util

# 运行使用示例
yarn example-http-usage
```

### 测试覆盖

- ✅ 基础请求功能
- ✅ 拦截器功能
- ✅ 超时控制
- ✅ 重试机制
- ✅ 请求取消
- ✅ 文件上传/下载
- ✅ 并发请求
- ✅ 错误处理

## 📝 API 参考

### HttpClient 类

#### 构造函数

```javascript
new HttpClient(options)
```

**参数:**
- `options.baseURL` - 基础URL
- `options.timeout` - 默认超时时间
- `options.retries` - 默认重试次数
- `options.retryDelay` - 默认重试延迟
- `options.withCredentials` - 是否携带凭证
- `options.headers` - 默认请求头

#### 方法

##### 请求方法

- `get(url, config)` - GET 请求
- `post(url, data, config)` - POST 请求
- `put(url, data, config)` - PUT 请求
- `patch(url, data, config)` - PATCH 请求
- `delete(url, config)` - DELETE 请求
- `upload(url, formData, config)` - 文件上传
- `download(url, config)` - 文件下载

##### 拦截器

- `addRequestInterceptor(interceptor)` - 添加请求拦截器
- `addResponseInterceptor(interceptor)` - 添加响应拦截器
- `addErrorInterceptor(interceptor)` - 添加错误拦截器

##### 请求控制

- `createAbortController(requestId)` - 创建取消控制器
- `cancelRequest(requestId)` - 取消指定请求
- `cancelAllRequests()` - 取消所有请求

### 响应对象

```javascript
{
  success: boolean,    // 是否成功
  data: any,          // 响应数据
  status: number,     // HTTP状态码
  message: string,    // 响应消息
  headers: Object     // 响应头
}
```

## 🔧 最佳实践

### 1. 统一错误处理

```javascript
// 添加全局错误拦截器
client.addErrorInterceptor((error) => {
  if (error.status === 401) {
    // 处理认证失败
    redirectToLogin();
  } else if (error.status >= 500) {
    // 处理服务器错误
    showErrorMessage('服务器错误，请稍后重试');
  }
  return error;
});
```

### 2. 请求日志记录

```javascript
// 请求拦截器 - 记录请求
client.addRequestInterceptor((config) => {
  console.log(`[${new Date().toISOString()}] ${config.method} ${config.url}`);
  return config;
});

// 响应拦截器 - 记录响应
client.addResponseInterceptor((response) => {
  console.log(`[${new Date().toISOString()}] ${response.status} ${response.message}`);
  return response;
});
```

### 3. 认证处理

```javascript
// 自动添加认证头
client.addRequestInterceptor((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 处理认证失败
client.addErrorInterceptor((error) => {
  if (error.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return error;
});
```

### 4. 请求去重

```javascript
const pendingRequests = new Map();

client.addRequestInterceptor((config) => {
  const key = `${config.method}:${config.url}`;
  
  if (pendingRequests.has(key)) {
    // 返回已存在的请求
    return pendingRequests.get(key);
  }
  
  // 创建新请求
  const request = client.request(config);
  pendingRequests.set(key, request);
  
  // 请求完成后清理
  request.finally(() => {
    pendingRequests.delete(key);
  });
  
  return request;
});
```

## 🐛 故障排除

### 常见问题

1. **CORS 错误**
   ```javascript
   // 确保服务器支持CORS，或使用代理
   const client = new HttpClient({
     baseURL: '/api'  // 使用相对路径
   });
   ```

2. **请求超时**
   ```javascript
   // 增加超时时间
   const response = await client.get('/api/data', {
     timeout: 30000  // 30秒
   });
   ```

3. **网络错误重试**
   ```javascript
   // 配置重试机制
   const response = await client.get('/api/data', {
     retries: 3,
     retryDelay: 2000
   });
   ```

## 📄 许可证

MIT License
