import request from '@/utils/request'
import { idempotentRequest } from '@/utils/idempotent'
import { Message } from 'element-ui'

export function fetchList(params) {
  return request({
    url:'/afterSale/list',
    method:'get',
    params:params
  })
}

export function deleteApply(params) {
  return request({
    url:'/afterSale/delete',
    method:'post',
    params:params
  })
}

/**
 * 更新售后单状态
 * @param {Number} id 售后单ID
 * @param {Object} data 状态参数，包含status和version等信息
 * @returns {Promise} 返回请求Promise
 */
export function updateApplyStatus(id, data) {
  // 参数验证
  if (!id || id <= 0) {
    Message.error('售后单ID无效');
    return Promise.reject(new Error('售后单ID无效'));
  }
  
  if (!data) {
    Message.error('状态参数不能为空');
    return Promise.reject(new Error('状态参数不能为空'));
  }
  
  if (data.status === undefined || data.status === null) {
    Message.error('状态值不能为空');
    return Promise.reject(new Error('状态值不能为空'));
  }
  
  // 确保version参数存在
  if (data.version === undefined || data.version === null) {
    Message.warning('版本号不存在，可能导致并发修改问题');
    // 不阻止请求，但给出警告
  }
  
  return idempotentRequest({
    url: '/afterSale/update/status/' + id,
    method: 'post',
    data: data
  });
}

export function getApplyDetail(id) {
  if (!id || id <= 0) {
    Message.error('售后单ID无效');
    return Promise.reject(new Error('售后单ID无效'));
  }
  
  return request({
    url:'/afterSale/'+id,
    method:'get'
  })
}

export function getOperationLogs(params) {
  return request({
    url: '/afterSale/log/list',
    method: 'get',
    params: params
  })
}

export function countOperationsByType(params) {
  return request({
    url: '/afterSale/log/statistic/type',
    method: 'get',
    params: params
  })
}

export function getStatusTransitionTime(params) {
  return request({
    url: '/afterSale/log/statistic/transition',
    method: 'get',
    params: params
  })
}

export function getAfterSaleStatistic() {
  return request({
    url: '/afterSale/statistic',
    method: 'get'
  })
}
