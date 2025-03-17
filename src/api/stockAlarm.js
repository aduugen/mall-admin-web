import request from '@/utils/request'

export function fetchList() {
  return request({
    url: '/stockAlarm/list',
    method: 'get'
  })
} 

export function fetchPageList(pageNum, pageSize) {
  return request({
    url: '/stockAlarm/list/page',
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  })
} 