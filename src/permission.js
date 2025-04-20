import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权

// 防止循环重定向
let redirectCount = 0;
const MAX_REDIRECTS = 5;
const whiteList = ['/login', '/404'] // 添加404到不重定向白名单

router.beforeEach((to, from, next) => {
  // 重置重定向计数器(如果不是从同一个页面重定向)
  if (from.path !== to.path) {
    redirectCount = 0;
  } else {
    // 检测潜在的重定向循环
    redirectCount++;
    if (redirectCount > MAX_REDIRECTS) {
      console.error('检测到重定向循环:', from.path, '->', to.path);
      redirectCount = 0;
      next('/404'); // 强制跳转到404页面
      return;
    }
  }

  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          let menus=res.data.menus;
          let username=res.data.username;
          store.dispatch('GenerateRoutes', { menus,username }).then(() => { // 生成可访问的路由表
            router.addRoutes(store.getters.addRouters); // 动态添加可访问路由表
            next({ ...to, replace: true })
          })
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})

// 添加全局错误处理以捕获路由错误
window.addEventListener('error', function(event) {
  console.error('全局错误:', event.error);
  // 可以添加更多错误处理逻辑
});
