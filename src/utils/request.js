import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

export const API_BASE_URL_ADMIN = 'http://192.168.1.10:8080';
// 创建axios实例
const service = axios.create({
  baseURL: API_BASE_URL_ADMIN, // 修正为BASE_API
  timeout: 30000, // 请求超时时间增加到30秒
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = getToken() // 直接使用token，不添加Bearer前缀
    }
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008:非法的token; 50012:其他客户端登录; 50014:Token过期;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // 重新登录
        store.dispatch('resetToken').then(() => {
          location.reload()
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    let message = '请求失败'
    if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
      message = '请求超时，请检查网络连接'
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          store.dispatch('resetToken').then(() => {
            location.reload()
          })
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误,未找到该资源'
          break
        case 500:
          message = '服务器端出错'
          break
        default:
          message = '连接错误' + error.response.status
      }
    } else {
      message = '连接到服务器失败'
    }
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
