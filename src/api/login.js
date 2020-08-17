import api from '@/utils/api'

export function getInfo(token) {
  return api({
    url: '/yun/login/getInfo',
    method: 'get',
    params: {token}
  })
}


