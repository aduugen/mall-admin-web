import request from '@/utils/request'
import { idempotentRequest } from '@/utils/idempotent'
import { Message } from 'element-ui'

// 添加防抖处理
const pendingRequests = new Map();

export function fetchList(params) {
  // 创建唯一请求标识
  const requestId = `fetchList_${JSON.stringify(params)}`;
  
  // 如果相同请求正在进行中，取消之前的请求
  if (pendingRequests.has(requestId)) {
    console.log('防止重复请求:', requestId);
    return pendingRequests.get(requestId);
  }
  
  // 发起请求并保存Promise
  const requestPromise = request({
    url:'/afterSale/list',
    method:'get',
    params:params
  }).finally(() => {
    // 请求完成后从Map中移除
    pendingRequests.delete(requestId);
  });
  
  // 将请求保存到Map中
  pendingRequests.set(requestId, requestPromise);
  
  return requestPromise;
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

export function getAfterSaleApplyDetail(id) {
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

/**
 * 回退售后单到待审核状态
 * @param {Number} id 售后单ID
 * @param {Number} version 版本号
 * @param {String} rollbackReason 回退原因
 * @returns {Promise} 返回请求Promise
 */
export function rollbackToAudit(id, version, rollbackReason) {
  // 参数验证
  if (!id || id <= 0) {
    Message.error('售后单ID无效');
    return Promise.reject(new Error('售后单ID无效'));
  }
  
  if (version === undefined || version === null) {
    Message.warning('版本号不存在，可能导致并发修改问题');
    // 不阻止请求，但给出警告
  }
  
  if (!rollbackReason) {
    Message.error('回退原因不能为空');
    return Promise.reject(new Error('回退原因不能为空'));
  }
  
  return idempotentRequest({
    url: `/afterSale/rollback/${id}`,
    method: 'post',
    params: {
      version: version,
      rollbackReason: rollbackReason
    }
  });
}
