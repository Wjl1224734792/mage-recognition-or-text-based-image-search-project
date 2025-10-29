/**
 * 嵌入服务路由
 * 定义 API 端点
 */

import express from 'express';
import {
  extractFeatures,
  extractFeaturesFromBlob
} from '../handlers/embedding.handler.js';

const router = express.Router();

/**
 * @route POST /extract
 * @desc 提取图像特征（通过URL）
 * @access Public
 * @body {string} imageInput - 图像URL
 */
router.post('/extract', extractFeatures);

/**
 * @route POST /extract/blob
 * @desc 提取图像特征（通过Blob对象）
 * @access Public
 * @body {Blob} imageBlob - 图像Blob对象
 */
router.post('/extract/blob', extractFeaturesFromBlob);


export { router as embeddingRoutes };
