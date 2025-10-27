/**
 * Milvus 数据库服务路由
 * 定义 API 端点
 */

import express from 'express';
import {
  insertImageVector,
  updateImageVector,
  syncImageVector,
  batchDeleteImageVectors,
  searchSimilarVectors,
  getCollectionStats
} from '../handlers/milvus.handler.js';

const router = express.Router();

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
 * @desc 搜索相似向量
 * @access Public
 * @body {string|Blob} imageInput - 图像输入（URL 或 Blob）
 * @body {number} [limit] - 返回结果数量限制（可选，默认20）
 */
router.post('/search', searchSimilarVectors);

/**
 * @route GET /stats
 * @desc 获取集合统计信息
 * @access Public
 */
router.get('/stats', getCollectionStats);

export { router as milvusRoutes };
