/**
 * Milvus 数据库服务路由
 * 定义 API 端点
 */

import express from 'express';
import multer from 'multer';
import {
  insertImageVector,
  updateImageVector,
  syncImageVector,
  batchDeleteImageVectors,
  searchSimilarVectors,
  searchSimilarVectorsWithBlob,
  getCollectionStats
} from '../handlers/milvus.handler.js';

const router = express.Router();

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(), // 使用内存存储
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制文件大小为 10MB
    files: 1, // 限制文件数量为 1
    fieldSize: 1024 * 1024, // 限制字段大小为 1MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图像文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图像文件'), false);
    }
  },
  // 添加清理中间件
  onFileUploadComplete: (file) => {
    console.log(`📁 文件上传完成: ${file.originalname}, 大小: ${file.size} bytes`);
  },
  onError: (error, next) => {
    console.error('❌ 文件上传错误:', error.message);
    next(error);
  }
});

// 添加全局清理中间件
router.use((req, res, next) => {
  // 在响应完成后清理文件缓冲区
  const originalSend = res.send;
  res.send = function(data) {
    // 调用原始 send 方法
    const result = originalSend.call(this, data);
    
    // 清理文件缓冲区
    if (req.file && req.file.buffer) {
      try {
        req.file.buffer.fill(0);
        console.log('🧹 全局清理：文件缓冲区已清理');
      } catch (error) {
        console.warn('⚠️ 全局清理警告:', error.message);
      }
    }
    
    return result;
  };
  
  next();
});

/**
 * @route POST /insert
 * @desc 插入图像向量
 * @access Public
 * @body {string} rowId - 行ID
 * @body {string|Blob} imageInput - 图像输入（URL 或 Blob）
 */
router.post('/insert', insertImageVector);

/**
 * @route POST /update
 * @desc 更新图像向量
 * @access Public
 * @body {string} rowId - 行ID
 * @body {string|Blob} imageInput - 图像输入（URL 或 Blob）
 */
router.post('/update', updateImageVector);

/**
 * @route POST /sync
 * @desc 同步图像向量（检查是否存在，不存在则插入）
 * @access Public
 * @body {string} rowId - 行ID
 * @body {string|Blob} imageInput - 图像输入（URL 或 Blob）
 */
router.post('/sync', syncImageVector);

/**
 * @route POST /batch-delete
 * @desc 批量删除图像向量
 * @access Public
 * @body {Array<string>} rowIds - 行ID数组
 */
router.post('/batch-delete', batchDeleteImageVectors);

/**
 * @route POST /search
 * @desc 搜索相似向量（通过URL）
 * @access Public
 * @body {string} imageInput - 图像URL
 * @body {number} [limit] - 返回结果数量限制（可选，默认20）
 */
router.post('/search', searchSimilarVectors);

/**
 * @route POST /search/blob
 * @desc 搜索相似向量（通过文件上传）
 * @access Public
 * @param {number} [limit] - 返回结果数量限制（可选，默认20）
 * @body {File} image - 图像文件（multipart/form-data）
 */
router.post('/search/blob', upload.single('image'), searchSimilarVectorsWithBlob);

/**
 * @route GET /stats
 * @desc 获取集合统计信息
 * @access Public
 */
router.get('/stats', getCollectionStats);


export { router as milvusRoutes };
