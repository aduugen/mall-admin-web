import request from '@/utils/request'

export function getTodayVisitorStats() {
  return request({
    url:'/admin/visitor/today',
    method:'get'
  })
}

export function getTotalVisitorCount() {
  return request({
    url:'/admin/visitor/total',
    method:'get'
  })
}