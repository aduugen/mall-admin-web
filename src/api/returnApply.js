import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/afterSale/list',
    method:'get',
    params:params
  })
}

export function deleteApply(params) {
  return request({
    url:'/afterSale/delete',
    method:'post',
    params:params
  })
}
export function updateApplyStatus(id,data) {
  return request({
    url:'/afterSale/update/status/'+id,
    method:'post',
    data:data
  })
}

export function getApplyDetail(id) {
  return request({
    url:'/afterSale/'+id,
    method:'get'
  })
}
