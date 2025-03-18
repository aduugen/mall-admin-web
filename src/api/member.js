import request from '@/utils/request'

export function getTotalMemberCount() {
  return request({
    url:'/member/count',
    method:'get'
  })
}

export function getTodayNewMemberCount() {
  return request({
    url:'/member/today',
    method:'get'
  })
}

export function fetchList(params) {
  return request({
    url: '/member/list',
    method: 'get',
    params: params
  })
}

export function getMember(id) {
  return request({
    url: '/member/' + id,
    method: 'get'
  })
}

export function fetchConsumptionList(params) {
  return request({
    url: '/member/consumption/list',
    method: 'get',
    params: params
  })
}

export function getMemberConsumption(id) {
  return request({
    url: '/member/consumption/' + id,
    method: 'get'
  })
}

export function fetchMemberOrders(id, params) {
  return request({
    url: '/member/' + id + '/orders',
    method: 'get',
    params: params
  })
}
