/**
 * 嵌入服务处理器
 * 处理 HTTP 请求和响应
 */

import embeddingService from '../services/embedding.service.js';

/**
 * 提取图像特征
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function extractFeatures(req, res) {
  try {
    const { imageInput } = req.body;

    // 验证必需参数
    if (!imageInput) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'imageInput 参数是必需的'
      });
    }

    console.log(`🔄 处理特征提取请求`);

    const result = await embeddingService.extractFeatures(imageInput);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 特征提取处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '特征提取失败',
      message: error.message
    });
  }
}

/**
 * 批量提取图像特征
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function batchExtractFeatures(req, res) {
  try {
    const { imageInputs } = req.body;

    // 验证必需参数
    if (!Array.isArray(imageInputs) || imageInputs.length === 0) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'imageInputs 参数必须是非空数组'
      });
    }

    console.log(`🔄 处理批量特征提取请求，数量: ${imageInputs.length}`);

    const results = await embeddingService.batchExtractFeatures(imageInputs);

    res.json({
      success: true,
      data: {
        results,
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      message: '批量特征提取完成'
    });

  } catch (error) {
    console.error('❌ 批量特征提取处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '批量特征提取失败',
      message: error.message
    });
  }
}

/**
 * 获取服务状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function getServiceStatus(req, res) {
  try {
    const stats = embeddingService.getStats();

    res.json({
      success: true,
      data: {
        service: 'embedding-service',
        status: 'running',
        timestamp: new Date().toISOString(),
        ...stats
      },
      message: '服务状态获取成功'
    });

  } catch (error) {
    console.error('❌ 获取服务状态失败:', error.message);
    res.status(500).json({
      success: false,
      error: '获取服务状态失败',
      message: error.message
    });
  }
}

/**
 * 获取可用模型列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function getAvailableModels(req, res) {
  try {
    const loadedModels = embeddingService.getLoadedModels();

    res.json({
      success: true,
      data: {
        loadedModels,
        totalLoaded: loadedModels.length
      },
      message: '可用模型列表获取成功'
    });

  } catch (error) {
    console.error('❌ 获取模型列表失败:', error.message);
    res.status(500).json({
      success: false,
      error: '获取模型列表失败',
      message: error.message
    });
  }
}
