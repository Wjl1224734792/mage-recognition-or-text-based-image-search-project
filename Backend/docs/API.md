# Milvus 数据库服务 API 文档

## 概述

本文档描述了 Milvus 数据库服务的所有 API 接口，包括请求参数、响应格式和使用示例。

**基础URL**: `http://localhost:3001`

## 接口列表

### 搜索接口
- **URL 搜索**: `POST /api/v1/milvus/search` - 通过图像URL搜索相似向量
- **文件上传搜索**: `POST /api/v1/milvus/search/blob` - 通过上传图像文件搜索相似向量

### 数据管理接口
- **插入向量**: `POST /api/v1/milvus/insert` - 插入新的图像向量
- **更新向量**: `POST /api/v1/milvus/update` - 更新现有的图像向量
- **同步向量**: `POST /api/v1/milvus/sync` - 检查向量是否存在，不存在则插入
- **批量删除**: `POST /api/v1/milvus/batch-delete` - 批量删除图像向量

### 系统接口
- **健康检查**: `GET /health` - 检查服务状态
- **集合统计**: `GET /api/v1/milvus/stats` - 获取集合统计信息

### 健康检查

**GET** `/health`

检查服务是否正常运行

**响应示例:**

```json
{
  "status": "healthy",
  "service": "database-service",
  "timestamp": "2025-10-22T08:53:58.176Z",
  "config": {
    "port": 3001,
    "maxConcurrency": 10,
    "milvusHost": "localhost",
    "milvusPort": 19530,
    "collectionName": "image_vectors"
  }
}
```

---


### 集合统计

**GET** `/api/v1/milvus/stats`

获取集合的统计信息

**响应示例:**

```json
{
  "success": true,
  "data": {
    "rowCount": 0
  }
}
```

---

### 插入向量

**POST** `/api/v1/milvus/insert`

插入新的图像向量

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| rowId | string | 是 | 图像唯一标识符 |
| imageInput | string|Blob | 是 | 图像URL或Blob对象 |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": {
      "row_id": "test_1761123238055",
      "insert_count": "1"
    },
    "message": "图像向量插入成功"
  }
}
```

---

### 同步向量

**POST** `/api/v1/milvus/sync`

检查向量是否存在，不存在则插入

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| rowId | string | 是 | 图像唯一标识符 |
| imageInput | string|Blob | 是 | 图像URL或Blob对象 |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "row_id": "test_1761123238055",
    "action": "inserted",
    "insert_count": "1",
    "dimension": 768
  },
  "message": "图像向量同步成功"
}
```

**跳过插入的响应示例:**

```json
{
  "success": true,
  "data": {
    "row_id": "test_1761123238055",
    "action": "skipped",
    "reason": "数据已存在"
  },
  "message": "数据已存在，跳过插入"
}
```

---

### 更新向量

**POST** `/api/v1/milvus/update`

更新现有的图像向量

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| rowId | string | 是 | 图像唯一标识符 |
| imageInput | string|Blob | 是 | 图像URL或Blob对象 |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": {
      "row_id": "test_1761123238055",
      "upsert_count": "1"
    },
    "message": "图像向量更新成功"
  }
}
```

---

### 搜索向量（通过URL）

**POST** `/api/v1/milvus/search`

通过图像URL搜索相似的图像向量

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| imageInput | string | 是 | 查询图像URL |
| limit | number | 否 | 返回结果数量，默认20 |

**请求示例:**

```json
{
  "imageInput": "https://example.com/image.jpg",
  "limit": 20
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": [],
    "message": "相似向量搜索成功"
  }
}
```

---

### 搜索向量（通过文件上传）

**POST** `/api/v1/milvus/search/blob`

通过上传图像文件搜索相似的图像向量

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| limit | number | 否 | 返回结果数量，默认20（查询参数） |
| image | File | 是 | 图像文件（multipart/form-data） |

**请求限制:**
- 文件大小：最大 10MB
- 文件类型：仅支持图像文件（jpg、png、gif、webp 等）
- 请求格式：multipart/form-data

**响应示例:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": [],
    "message": "相似向量搜索成功"
  }
}
```

---

### 批量删除

**POST** `/api/v1/milvus/batch-delete`

批量删除图像向量

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| rowIds | string[] | 是 | 要删除的图像ID数组 |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": {
      "deletedCount": 3
    },
    "message": "批量删除成功"
  }
}
```

---

## 使用示例

### JavaScript 示例

#### URL 搜索
```javascript
// 通过URL搜索相似向量
const response = await fetch('http://localhost:3001/api/v1/milvus/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageInput: 'https://example.com/image.jpg',
    limit: 20
  })
});

const result = await response.json();
console.log(result);
```

#### 文件上传搜索
```javascript
// 通过文件上传搜索相似向量
const formData = new FormData();
formData.append('image', fileInput.files[0]); // fileInput 是文件输入元素

const response = await fetch('http://localhost:3001/api/v1/milvus/search/blob?limit=20', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```


#### 插入图像向量
```javascript
// 插入图像向量
const response = await fetch('http://localhost:3001/api/v1/milvus/insert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rowId: 'img_001',
    imageInput: 'https://example.com/image.jpg'
  })
});

const result = await response.json();
console.log(result);
```

### cURL 示例

#### URL 搜索
```bash
# 通过URL搜索相似向量
curl -X POST http://localhost:3001/api/v1/milvus/search \
  -H "Content-Type: application/json" \
  -d '{
    "imageInput": "https://example.com/image.jpg",
    "limit": 20
  }'
```

#### 文件上传搜索
```bash
# 通过文件上传搜索相似向量
curl -X POST "http://localhost:3001/api/v1/milvus/search/blob?limit=20" \
  -F "image=@/path/to/image.jpg"
```


#### 插入图像向量
```bash
# 插入图像向量
curl -X POST http://localhost:3001/api/v1/milvus/insert \
  -H "Content-Type: application/json" \
  -d '{
    "rowId": "img_001",
    "imageInput": "https://example.com/image.jpg"
  }'
```

---

## 错误处理

### 常见错误码

| 状态码 | 错误类型 | 描述 |
|--------|----------|------|
| 400 | 参数错误 | 请求参数缺失或格式不正确 |
| 413 | 文件过大 | 上传的文件超过 10MB 限制 |
| 415 | 文件类型错误 | 上传的文件不是图像格式 |
| 500 | 服务器错误 | 内部服务器错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": "错误类型",
  "message": "详细错误信息"
}
```

### 文件上传限制

- **文件大小**: 最大 10MB
- **支持格式**: jpg, jpeg, png, gif, webp, bmp
- **请求格式**: multipart/form-data
- **字段名称**: image

