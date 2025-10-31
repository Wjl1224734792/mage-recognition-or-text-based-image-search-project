/**
 * Milvus 数据库服务处理器
 * 处理 HTTP 请求和响应
 */

import milvusService from '../services/milvus.service.js';

// 允许的图像文件 MIME 类型白名单（与路由配置保持一致）
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',   // JPEG
  'image/jpg',    // JPEG (另一种表示)
  'image/png',    // PNG
  'image/gif',    // GIF
  'image/bmp',    // BMP
  'image/tiff',   // TIFF
  'image/webp',   // WebP
];

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
 * 搜索相似向量（通过URL）
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

    const options = {
      limit,
      output_fields: ['row_id']
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
 * 搜索相似向量（通过文件上传）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function searchSimilarVectorsWithBlob(req, res) {
  let imageBlob = null;
  
  try {
    const { limit } = req.query;
    const imageFile = req.file;

    // 验证必需参数
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: '请上传图像文件'
      });
    }

    // 显式验证图像文件格式（双重验证，确保安全性）
    const mimeType = imageFile.mimetype.toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        error: '文件类型错误',
        message: `不支持的文件类型: ${imageFile.mimetype}。只允许上传以下图像格式: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        allowedTypes: ALLOWED_IMAGE_TYPES
      });
    }

    const options = {
      limit: limit ? parseInt(limit) : undefined,
      output_fields: ['row_id']
    };

    // 将文件转换为 Blob 对象
    imageBlob = new Blob([imageFile.buffer], { type: imageFile.mimetype });
    
    
    const result = await milvusService.searchSimilarVectors(imageBlob, options);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ 文件上传搜索处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: '搜索失败',
      message: error.message
    });
  } finally {
    // 清理内存：释放 Blob 对象
    if (imageBlob) {
      try {
        imageBlob = null;
      } catch (cleanupError) {
        // 清理失败，静默处理
      }
    }
    
    // 清理 multer 文件缓冲区
    if (req.file && req.file.buffer) {
      try {
        req.file.buffer.fill(0);
      } catch (bufferCleanupError) {
        // 清理失败，静默处理
      }
    }
    
    // 清理请求对象中的文件引用
    if (req.file) {
      try {
        req.file = null;
      } catch (fileRefCleanupError) {
        // 清理失败，静默处理
      }
    }
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

