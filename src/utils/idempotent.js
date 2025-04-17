import { getIdempotentToken } from '@/api/token'
import request from '@/utils/request'
import { Message } from 'element-ui'

/**
 * 幂等性请求封装器
 * 自动获取幂等性令牌并在请求头中添加
 * 
 * @param {Object} options 请求配置
 * @param {String} options.url 请求路径
 * @param {String} options.method 请求方法
 * @param {Object} options.data 请求数据
 * @param {Object} options.params 请求参数
 * @returns {Promise} 请求结果Promise
 */
export async function idempotentRequest(options) {
  try {
    // 验证参数
    if (!options || !options.url) {
      Message.error('请求参数无效');
      return Promise.reject(new Error('请求参数无效'));
    }
    
    // 获取幂等性令牌
    let retryCount = 0;
    let tokenResponse = null;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        tokenResponse = await getIdempotentToken();
        if (tokenResponse && tokenResponse.data && tokenResponse.data.token) {
          break;
        }
        retryCount++;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw error;
        }
        // 等待短暂时间后重试
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!tokenResponse || !tokenResponse.data || !tokenResponse.data.token) {
      Message.error('获取幂等性令牌失败，请稍后重试');
      return Promise.reject(new Error('获取幂等性令牌失败'));
    }
    
    // 克隆请求选项，避免修改原对象
    const requestOptions = { ...options };
    
    // 确保headers存在
    requestOptions.headers = requestOptions.headers || {};
    
    // 在请求头中添加幂等性令牌
    requestOptions.headers['Idempotent-Token'] = tokenResponse.data.token;
    
    // 记录令牌，便于调试
    console.debug('幂等性请求令牌:', tokenResponse.data.token, '请求URL:', options.url);
    
    // 发送请求
    return request(requestOptions).catch(error => {
      // 特殊处理幂等性错误
      if (error && error.message && error.message.includes('请勿重复提交')) {
        Message.warning('操作正在处理中，请勿重复提交');
      }
      return Promise.reject(error);
    });
  } catch (error) {
    console.error('幂等性请求失败:', error);
    Message.error(error.message || '请求失败，请稍后重试');
    return Promise.reject(error);
  }
}

/**
 * 创建一个基于指定URL和方法的幂等性请求函数
 * 
 * @param {String} url 请求URL
 * @param {String} method 请求方法
 * @returns {Function} 返回一个接受data参数的函数
 */
export function createIdempotentRequest(url, method = 'post') {
  return function(data, params) {
    // 验证参数
    if (url.includes('undefined') || url.includes('null')) {
      Message.error('请求参数无效');
      return Promise.reject(new Error('请求URL包含无效参数'));
    }
    
    return idempotentRequest({
      url,
      method,
      data,
      params
    });
  }
} 