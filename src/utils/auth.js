import Cookies from 'js-cookie'

const LoginKey = 'already_Login'

export function getToken() {
  return Cookies.get(LoginKey);
}

export function setToken(roleId) {
  return Cookies.set(LoginKey, roleId)
}

export function removeToken() {
  return Cookies.remove(LoginKey)
}
