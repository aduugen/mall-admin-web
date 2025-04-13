import request from '@/utils/request'

export function getOrderReturnApplyStatistic() {
  return request({
    url: '/afterSale/statusStatistic',
    method: 'get'
  })
}


