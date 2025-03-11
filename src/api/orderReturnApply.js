import request from '@/utils/request'

export function getOrderReturnApplyStatistic() {
  return request({
    url: '/returnApply/statusStatistic',
    method: 'get'
  })
}


