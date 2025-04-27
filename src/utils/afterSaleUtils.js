import { updateApplyStatus, getAfterSaleApplyDetail } from '@/api/returnApply'
import { Message, Loading } from 'element-ui'

/**
 * 售后单状态常量映射
 */
export const STATUS = {
  PENDING: 0,        // 待处理
  APPROVED: 1,       // 已同意
  REJECTED: 2,       // 已拒绝
  SHIPPED: 3,        // 已发货
  RECEIVED: 4,       // 已收货
  CHECKING: 5,       // 质检中
  CHECK_PASS: 6,     // 质检通过
  CHECK_FAIL: 7,     // 质检不通过
  REFUNDING: 8,      // 退款中
  COMPLETED: 9       // 已完成
};

/**
 * 状态转换验证规则
 */
export const STATUS_TRANSITIONS = {
  [STATUS.PENDING]: [STATUS.APPROVED, STATUS.REJECTED],
  [STATUS.APPROVED]: [STATUS.SHIPPED],
  [STATUS.SHIPPED]: [STATUS.RECEIVED],
  [STATUS.RECEIVED]: [STATUS.CHECKING],
  [STATUS.CHECKING]: [STATUS.CHECK_PASS, STATUS.CHECK_FAIL],
  [STATUS.CHECK_PASS]: [STATUS.REFUNDING],
  [STATUS.CHECK_FAIL]: [STATUS.REJECTED],
  [STATUS.REFUNDING]: [STATUS.COMPLETED],
  [STATUS.REJECTED]: [],
  [STATUS.COMPLETED]: []
};

/**
 * 安全更新售后状态并处理错误
 * 
 * @param {Number} id 售后单ID
 * @param {Object} statusData 状态更新数据
 * @param {Function} successCallback 成功回调
 * @param {Function} errorCallback 错误回调
 * @param {Boolean} showSuccessMessage 是否显示成功消息
 * @param {Boolean} showLoadingIndicator 是否显示加载指示器
 * @returns {Promise} 请求Promise
 */
export function safeUpdateStatus(id, statusData, successCallback, errorCallback, 
    showSuccessMessage = true, showLoadingIndicator = true) {
  
  // 创建加载指示器
  let loadingInstance = null;
  if (showLoadingIndicator) {
    loadingInstance = Loading.service({
      lock: true,
      text: '正在处理，请稍候...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    });
  }
  
  // 检查请求状态是否有效
  const isValid = validateStatusTransition(
    statusData.oldStatus, 
    statusData.status
  );
  
  if (!isValid) {
    if (loadingInstance) loadingInstance.close();
    Message.error('状态转换不合法，请刷新页面重试');
    return Promise.reject(new Error('状态转换不合法'));
  }
  
  return updateApplyStatus(id, statusData)
    .then(response => {
      if (loadingInstance) loadingInstance.close();
      
      if (showSuccessMessage) {
        Message({
          type: 'success',
          message: '状态更新成功!'
        });
      }
      
      if (successCallback && typeof successCallback === 'function') {
        successCallback(response);
      }
      
      return response;
    })
    .catch(error => {
      if (loadingInstance) loadingInstance.close();
      
      Message({
        type: 'error',
        message: '状态更新失败: ' + (error.message || '未知错误')
      });
      
      if (errorCallback && typeof errorCallback === 'function') {
        errorCallback(error);
      }
      
      return Promise.reject(error);
    });
}

/**
 * 加载售后详情并处理错误
 * 
 * @param {Number} id 售后单ID
 * @param {Function} successCallback 成功回调
 * @param {Function} errorCallback 错误回调
 * @param {Boolean} showLoadingIndicator 是否显示加载指示器
 * @returns {Promise} 请求Promise
 */
export function loadAfterSaleDetail(id, successCallback, errorCallback, showLoadingIndicator = true) {
  // 创建加载指示器
  let loadingInstance = null;
  if (showLoadingIndicator) {
    loadingInstance = Loading.service({
      lock: true,
      text: '加载数据中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    });
  }
  
  return getAfterSaleApplyDetail(id)
    .then(response => {
      if (loadingInstance) loadingInstance.close();
      
      if (successCallback && typeof successCallback === 'function') {
        successCallback(response.data);
      }
      return response;
    })
    .catch(error => {
      if (loadingInstance) loadingInstance.close();
      
      Message({
        type: 'error',
        message: '获取售后详情失败: ' + (error.message || '未知错误')
      });
      
      if (errorCallback && typeof errorCallback === 'function') {
        errorCallback(error);
      }
      
      return Promise.reject(error);
    });
}

/**
 * 验证状态转换是否合法
 * 
 * @param {Number} oldStatus 当前状态
 * @param {Number} newStatus 目标状态
 * @returns {Boolean} 状态转换是否合法
 */
export function validateStatusTransition(oldStatus, newStatus) {
  // 若未提供当前状态，则不做检查
  if (oldStatus === undefined || oldStatus === null) {
    return true;
  }
  
  // 获取当前状态允许的下一个状态列表
  const allowedNextStates = STATUS_TRANSITIONS[oldStatus] || [];
  
  // 检查目标状态是否在允许的状态列表中
  return allowedNextStates.includes(newStatus);
}

/**
 * 验证售后状态参数
 * 
 * @param {Object} params 状态参数
 * @param {Number} targetStatus 目标状态
 * @returns {Boolean} 验证结果
 */
export function validateStatusParams(params, targetStatus) {
  if (!params) {
    Message.warning('参数不能为空');
    return false;
  }
  
  // 验证状态
  if (params.status === undefined || params.status === null) {
    Message.warning('状态不能为空');
    return false;
  }
  
  // 确保目标状态一致
  if (targetStatus !== undefined && params.status !== targetStatus) {
    params.status = targetStatus;
  }
  
  // 验证版本号
  if (params.version === undefined || params.version === null) {
    Message.warning('版本号不存在，可能导致并发修改问题');
    // 不阻止提交，但给出警告
  }
  
  // 针对不同状态的特定验证
  switch (params.status) {
    case STATUS.APPROVED: // 同意申请
      if (!params.servicePointId) {
        Message.warning('请选择收货地址');
        return false;
      }
      if (!params.returnAmount) {
        Message.warning('请输入退款金额');
        return false;
      }
      break;
    case STATUS.REJECTED: // 拒绝申请
      if (!params.handleNote) {
        Message.warning('请输入拒绝原因');
        return false;
      }
      break;
    case STATUS.SHIPPED: // 已发货
      if (!params.logisticsCompany) {
        Message.warning('请输入物流公司');
        return false;
      }
      if (!params.logisticsNumber) {
        Message.warning('请输入物流单号');
        return false;
      }
      break;
    case STATUS.CHECK_PASS:
    case STATUS.CHECK_FAIL:
      if (!params.checkNote) {
        Message.warning('请输入质检结果说明');
        return false;
      }
      break;
    case STATUS.REFUNDING:
      if (!params.returnAmount) {
        Message.warning('请输入退款金额');
        return false;
      }
      if (!params.refundType) {
        Message.warning('请选择退款方式');
        return false;
      }
      break;
  }
  
  return true;
} 