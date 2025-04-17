import request from '@/utils/request'

/**
 * 获取幂等性令牌
 * @returns {Promise} 包含token的结果Promise
 */
export function getIdempotentToken() {
  return request({
    url: '/token/idempotent',
    method: 'get'
  })
} 