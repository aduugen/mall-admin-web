import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/servicePoint/list',
    method: 'get',
    params: params
  })
}

export function createServicePoint(data) {
  return request({
    url: '/servicePoint/create',
    method: 'post',
    data: data
  })
}

export function updateServicePoint(id, data) {
  return request({
    url: '/servicePoint/update/' + id,
    method: 'post',
    data: data
  })
}

export function getServicePoint(id) {
  return request({
    url: '/servicePoint/' + id,
    method: 'get'
  })
}

export function deleteServicePoint(id) {
  return request({
    url: '/servicePoint/delete/' + id,
    method: 'post'
  })
}

export function fetchAllServicePoint() {
  return request({
    url: '/servicePoint/listAll',
    method: 'get'
  })
}

export function updateServicePointStatus(id, status) {
  return request({
    url: '/servicePoint/updateStatus',
    method: 'post',
    params: {
      id,
      status
    }
  })
}

export function getServicePointsByType(type) {
  return request({
    url: '/servicePoint/type/' + type,
    method: 'get'
  })
}

export function updateServicePointBillCount(id, selfPickCount, receiveCount) {
  return request({
    url: '/servicePoint/updateBillCount',
    method: 'post',
    params: {
      id,
      selfPickCount,
      receiveCount
    }
  })
}

export function updateServicePointRating(id, rating) {
  return request({
    url: '/servicePoint/updateServiceRating',
    method: 'post',
    params: {
      id,
      rating
    }
  })
}

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