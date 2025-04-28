import request from '@/utils/request'

/**
 * 获取售后单详情
 * @param {Number} id 售后单ID
 */
export function getAfterSaleApplyDetail(id) {
  return request({
    url: `/afterSale/${id}`,
    method: 'get'
  })
}

/**
 * 更新售后单状态
 * @param {Number} id 售后单ID
 * @param {Object} data 状态更新参数
 */
export function updateAfterSaleStatus(id, data) {
  return request({
    url: `/afterSale/update/status/${id}`,
    method: 'post',
    data: data
  })
}

/**
 * 回退售后单到待审核状态
 * @param {Number} id 售后单ID
 * @param {Number} version 数据版本号
 * @param {String} rollbackReason 回退原因
 */
export function rollbackToAudit(id, version, rollbackReason) {
  return request({
    url: `/afterSale/rollback/${id}`,
    method: 'post',
    params: {
      version: version,
      rollbackReason: rollbackReason
    }
  })
}

/**
 * 获取服务点详情
 * @param {Number} id 服务点ID
 */
export function fetchServicePointDetail(id) {
  return request({
    url: `/servicePoint/${id}`,
    method: 'get'
  })
}

/**
 * 搜索收货点
 * @param {String} keyword 关键词
 */
export function searchReceivePoints(keyword) {
  return request({
    url: '/servicePoint/searchReceivePoints',
    method: 'get',
    params: {
      keyword: keyword,
      status: 0 // 只查询正常状态的网点
    }
  })
} 