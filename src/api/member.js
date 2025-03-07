import request from '@/utils/request'

export function getTotalMemberCount() {
  return request({
    url:'/admin/totalmembercount',
    method:'get'
  })
}
