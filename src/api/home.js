import request from '@/utils/request'

export function getHomeChartData(params) {
  return request({
    url: '/home/statistics/chart',
    method: 'get',
    params: params
  })
} 