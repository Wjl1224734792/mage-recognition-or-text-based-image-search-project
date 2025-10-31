/**
 * 嵌入服务处理器
 * 处理 HTTP 请求和响应
 */

import embeddingService from '../services/embedding.service.js';

/**
 * 提取图像特征（通过URL）
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

    // 验证输入类型（只接受URL字符串）
    if (typeof imageInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: '参数类型错误',
        message: 'imageInput 必须是字符串类型的URL'
      });
    }

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
 * 提取图像特征（通过Blob对象）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export async function extractFeaturesFromBlob(req, res) {
  let imageBlob = null;
  
  try {
    const { imageBlob: inputBlob } = req.body;

    // 验证必需参数
    if (!inputBlob) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: 'imageBlob 参数是必需的'
      });
    }

    // 处理通过HTTP传递的Blob数据
    if (inputBlob instanceof Blob) {
      // 如果是真正的Blob对象，直接使用
      imageBlob = inputBlob;
    } else if (inputBlob && typeof inputBlob === 'object' && inputBlob.data) {
      // 如果是通过HTTP传递的Blob数据，重新构造Blob对象
      const { data, type = 'image/jpeg' } = inputBlob;
      if (Array.isArray(data)) {
        // 如果是数组，转换为Uint8Array
        imageBlob = new Blob([new Uint8Array(data)], { type });
      } else if (typeof data === 'string') {
        // 如果是base64字符串，解码后创建Blob
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageBlob = new Blob([bytes], { type });
      } else {
        throw new Error('无法处理的Blob数据格式');
      }
    } else {
      return res.status(400).json({
        success: false,
        error: '参数类型错误',
        message: 'imageBlob 必须是Blob对象或包含data字段的对象'
      });
    }

    const result = await embeddingService.extractFeaturesFromBlob(imageBlob);

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Blob特征提取处理失败:', error.message);
    res.status(500).json({
      success: false,
      error: 'Blob特征提取失败',
      message: error.message
    });
    } finally {
      // 清理Blob对象
      if (imageBlob) {
        try {
          imageBlob = null;
        } catch (cleanupError) {
          // 清理失败，静默处理
        }
      }
    }
}

