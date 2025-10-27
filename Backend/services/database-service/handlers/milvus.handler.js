/**
 * Milvus 数据库服务处理器
 * 处理 HTTP 请求和响应
 */

import milvusService from '../services/milvus.service.js';

/**
 * 插入图像向量
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function insertImageVector(req, res) {
  try {
    const { rowId, imageInput } = req.body;

    // 验证必需参数
    if (!rowId || !imageInput) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'rowId 和 imageInput 参数是必需的'
      });
    }

    console.log(`🔄 处理插入请求`);

    const result = await milvusService.insertImageVector(rowId, imageInput);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 插入处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '插入失败',
      message: error.message
    });
  }
}

/**
 * 更新图像向量
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function updateImageVector(req, res) {
  try {
    const { rowId, imageInput } = req.body;

    // 验证必需参数
    if (!rowId || !imageInput) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'rowId 和 imageInput 参数是必需的'
      });
    }

    console.log(`🔄 处理更新请求`);

    const result = await milvusService.updateImageVector(rowId, imageInput);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 更新处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '更新失败',
      message: error.message
    });
  }
}

/**
 * 批量删除图像向量
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function batchDeleteImageVectors(req, res) {
  try {
    const { rowIds } = req.body;

    // 验证必需参数
    if (!Array.isArray(rowIds) || rowIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'rowIds 参数必须是非空数组'
      });
    }

    console.log(`🔄 处理批量删除请求`);

    const result = await milvusService.batchDeleteImageVectors(rowIds);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 批量删除处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '批量删除失败',
      message: error.message
    });
  }
}

/**
 * 搜索相似向量
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function searchSimilarVectors(req, res) {
  try {
    const { imageInput, limit } = req.body;

    // 验证必需参数
    if (!imageInput) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'imageInput 参数是必需的'
      });
    }

    console.log(`🔄 处理搜索请求`);

    const options = {
      limit,
      output_fields: ['row_id'] // 固定输出字段为 row_id
    };

    const result = await milvusService.searchSimilarVectors(imageInput, options);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 搜索处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '搜索失败',
      message: error.message
    });
  }
}


/**
 * 同步图像向量
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function syncImageVector(req, res) {
  try {
    const { rowId, imageInput } = req.body;

    // 验证必需参数
    if (!rowId || !imageInput) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'rowId 和 imageInput 参数是必需的'
      });
    }

    console.log(`🔄 处理同步请求`);

    const result = await milvusService.syncImageVector(rowId, imageInput);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 同步处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '同步失败',
      message: error.message
    });
  }
}

/**
 * 获取集合统计信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function getCollectionStats(req, res) {
  try {
    console.log('🔄 处理获取集合统计信息请求');

    const result = await milvusService.getCollectionStats();

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 获取集合统计信息失败:', error.message);
    res.status(500).json({
      success: false,
      error: '获取集合统计信息失败',
      message: error.message
    });
  }
}
