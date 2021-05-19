import { axios } from '@/utils/request'

/**
 * 菜单设置
 * @type {{deleteMenu: string, updateMenu: string, getMenuList: string, getMenuInfo: string}}
 */
const api = {
  getMenuList: '/menu/list',
  getMenuInfo: '/menu/info',
  updateMenu: '/menu/update',
  deleteMenu: '/menu/delete'
}

/**
 * 获取所有菜单列表
 * @returns {AxiosPromise}
 */
export function getMenuList (parameter) {
  return axios({
    url: api.getMenuList,
    method: 'get',
    params: parameter
  })
}

/**
 * 获取菜单详细信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function getMenuInfo (parameter) {
  return axios({
    url: api.getMenuInfo,
    method: 'get',
    params: parameter
  })
}

/**
 * 更新菜单信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function updateMenu (parameter) {
  return axios({
    url: api.updateMenu,
    method: 'post',
    data: parameter
  })
}

/**
 * 禁用菜单
 * @param parameter
 * @returns {AxiosPromise}
 */
export function deleteMenu (parameter) {
  return axios({
    url: api.deleteMenu,
    method: 'delete',
    params: parameter
  })
}
