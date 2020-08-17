import router from './router'
import store from './store'
import NProgress from 'nprogress' 
import 'nprogress/nprogress.css' 
import {getToken} from '@/utils/auth' 
const whiteList = ['/login', '/404'] 
router.beforeEach((to, from, next) => {
  NProgress.start()
  // determine whether the user has logged in
  const hasToken = getToken();

  if (hasToken) {
    if (to.path === '/login') {
      next({path: '/'})
      NProgress.done() 
    } else if (!store.getters.role) {
      store.dispatch('getCurrent').then(() => {
        next({...to})
      })
    } else {
      next()
    }
  } else if (whiteList.indexOf(to.path) !== -1) {
    
    next()
  } else {
  
    next('/login')
    NProgress.done() 
  }
})
router.afterEach(() => {
  NProgress.done()
})
// 属于权限模块，一般可以当成工具类