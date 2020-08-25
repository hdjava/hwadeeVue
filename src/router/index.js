import Vue from 'vue'
import Router from 'vue-router'
// Array提醒：布局设置
/* layout */
import Layout from '../views/layout/Layout'

const _import = require('./_import_' + process.env.NODE_ENV)
Vue.use(Router)
export const constantRouterMap = [{
    path: '/login',
    component: _import('login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: _import('404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: '首页',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: _import('dashboard/index')
    }]
  }
]
export default new Router({
  mode: 'history', //后端支持可开启或者关闭
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})
export const asyncRouterMap = [{
    path: '/product',
    component: Layout,
    redirect: '/product/mix-product',
    name: '业务',
    meta: {
      title: '业务',
      icon: 'tree'
    },
    children: [{
      path: 'mix-product',
      name: '商品信息',
      component: _import('product/mix-product'),
      meta: {
        title: '商品信息',
        icon: 'daso'
      },
      menu: 'product'
    }, ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/',
    name: '',
    meta: {
      title: '用户权限',
      icon: 'list'
    },
    children: [{
        path: '',
        name: '用户列表',
        component: _import('user/user'),
        meta: {
          title: '用户列表',
          icon: 'user-role'
        },
        menu: 'user'
      },
      // {
      //   path: 'role',
      //   name: '权限管理',
      //   component: _import('user/role'),
      //   meta: {
      //     title: '权限管理',
      //     icon: 'lock'
      //   },
      //   menu: 'role'
      // },
    ]
  },
  {
    path: '/charts',
    component: Layout,
    redirect: '/charts/mix-chart',
    name: '图表组件',
    meta: {
      title: '图表组件',
      icon: 'tree'
    },
    children: [{
      path: 'mix-chart',
      name: '图表信息',
      component: _import('charts/mix-chart'),
      meta: {
        title: '图表管理',
        icon: 'daso'
      },
      menu: 'charts'
    }, ]
  },
  {
    path: '/menus',
    component: Layout,
    redirect: '/menus/mix-menus',
    name: '菜单组件',
    meta: {
      title: '业务',
      icon: 'tree'
    },
    children: [{
      path: 'mix-menus',
      name: '菜单管理',
      component: _import('menus/mix-menus'),
      meta: {
        title: '菜单管理',
        icon: 'daso'
      },
      menu: 'menus'
    }, ]
  },
  {
    path: '/role',
    component: Layout,
    redirect: '/role/mix-role',
    name: '权限组件',
    meta: {
      title: '业务',
      icon: 'role'
    },
    children: [{
      path: 'mix-role',
      name: '角色管理',
      component: _import('role/mix-role'),
      meta: {
        title: '角色管理',
        icon: 'daso'
      },
      menu: 'role'
    }, ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]
