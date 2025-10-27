# Milvus 数据库服务 API 文档

## 概述

本文档描述了 Milvus 数据库服务的所有 API 接口，包括请求参数、响应格式和使用示例。

**基础URL**: `http://localhost:3001`

## 接口列表

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

### 搜索向量

**POST** `/api/v1/milvus/search`

搜索相似的图像向量

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| imageInput | string|Blob | 是 | 查询图像URL或Blob对象 |
| limit | number | 否 | 返回结果数量，默认20 |

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

```bash
# 插入图像向量
curl -X POST http://localhost:3001/api/v1/milvus/insert \
  -H "Content-Type: application/json" \
  -d '{
    "rowId": "img_001",
    "imageInput": "https://example.com/image.jpg"
  }'
```

