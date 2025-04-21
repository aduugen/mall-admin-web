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