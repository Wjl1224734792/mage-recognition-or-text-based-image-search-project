/**
 * 嵌入服务路由
 * 定义 API 端点
 */

import express from 'express';
import {
  extractFeatures,
  batchExtractFeatures,
  getServiceStatus,
  getAvailableModels
} from '../handlers/embedding.handler.js';

const router = express.Router();

/**
 * @route POST /extract
 * @desc 提取图像特征
 * @access Public
 * @body {string|Blob} imageInput - 图像输入（URL 或 Blob）
 */
router.post('/extract', extractFeatures);

/**
 * @route POST /batch-extract
 * @desc 批量提取图像特征
 * @access Public
 * @body {Array} imageInputs - 图像输入数组
 */
router.post('/batch-extract', batchExtractFeatures);

/**
 * @route GET /status
 * @desc 获取服务状态
 * @access Public
 */
router.get('/status', getServiceStatus);

/**
 * @route GET /models
 * @desc 获取可用模型列表
 * @access Public
 */
router.get('/models', getAvailableModels);

export { router as embeddingRoutes };
