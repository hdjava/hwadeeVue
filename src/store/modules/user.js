import {
  getInfo,
  login,
  logout
} from '@/api/login'
import {
  getToken,
  removeToken,
  setToken
} from '@/utils/auth'
import {
  default as api
} from '../../utils/api'
import store from '..'
import router from '../../router'

const user = {
  state: {
    realName: "",
    userId: "",
    avatar: 'https://edu-image.nosdn.127.net/0839BD8E0A94790F9FDBC070DADA4B20.jpg',
    role: '',
    menus: [],
    permissions: [],
  },
  mutations: {
    SET_USER: (state, userInfo) => {

      state.realName = userInfo.realName;
      state.userId = userInfo.id;
      state.role = userInfo.roleId;
      state.menus = userInfo.menuList;
      state.permissions = userInfo.permissionList;
    },
    RESET_USER: (state) => {
      state.realName = "";
      state.userId = "";
      state.role = '';
      state.menus = [];
      state.permissions = [];
    }
  },
  actions: {
    // 登录
    Login({
      commit,
      state
    }, loginForm) {
      return new Promise((resolve, reject) => {
        api({
          url: "yun/login/auth",
          method: "post",
          data: loginForm
        }).then(data => {

          if (data.data.result == "success") {
            //cookie中保存前端登录状态

            setToken(data.data.roleId);
          }
          console.log('data:', data)
          resolve(data);
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 获取用户信息
    getCurrent({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        api({
          url: 'yun/login/getInfo',
          method: 'post'
        }).then(data => {
          //console.log('获取用户信息',data)       
          //储存用户信息
          commit('SET_USER', data);
          //cookie保存登录状态,仅靠vuex保存的话,页面刷新就会丢失登录状态
          setToken(data.roleId);
          //生成路由
          let userPermission = data;
          store.dispatch('GenerateRoutes', userPermission).then(() => {
            //生成该用户的新路由json操作完毕之后,调用vue-router的动态新增路由方法,将新路由添加
            router.addRoutes(store.getters.addRouters)
          })
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    LogOut({
      commit
    }) {
      return new Promise((resolve) => {
        api({
          url: "yun/login/logout",
          method: "post"
        }).then(data => {
          commit('RESET_USER')
          removeToken()
          resolve(data);
        }).catch(() => {
          commit('RESET_USER')
          removeToken()
        })
      })
    },
    // 前端 登出
    FedLogOut({
      commit
    }) {
      return new Promise(resolve => {
        commit('RESET_USER')
        removeToken()
        resolve()
      })
    }
  }
}
export default user
