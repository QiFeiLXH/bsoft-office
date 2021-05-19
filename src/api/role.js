import { axios } from '@/utils/request'

/**
 * 角色设置相关
 * @type {{add: string, getOrgPersonList: string, getMenuAuthList: string, getRolePersonList: string, get: string, saveMenuAuth: string, getDeptTree: string, getPersonList: string, saveRolePerson: string}}
 */
const api = {
  get: '/role/roleList',
  add: '/role/roleAdd',
  delete: '/role/delete',
  getPersonList: '/role/personList',
  getRolePersonList: '/role/rolePersonList',
  saveRolePerson: '/role/saveRolePerson',
  getOrgPersonList: '/role/orgPersonList',
  getMenuAuthList: '/role/MenuAuthList',
  saveMenuAuth: '/role/saveRoleMenuAuth',
  getDeptTree: '/role/deptTree',
  findPersonSelectList: '/role/personSelectList'
}

/**
 * 获取角色列表
 * @returns {AxiosPromise}
 */
export function getRoleList () {
  return axios({
    url: api.get,
    method: 'get'
  })
}

/**
 * 添加新角色，并返回最新角色列表
 * @param parameter
 * @returns {AxiosPromise}
 */
export function addRole (parameter) {
  return axios({
    url: api.add,
    method: 'post',
    data: parameter
  })
}

/**
 * 删除角色，及角色权限信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function deleteRole (parameter) {
  return axios({
    url: api.delete,
    method: 'delete',
    params: parameter
  })
}

/**
 * 设置角色用户时,根据姓名或验证码获取人员信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function getPersonList (parameter) {
  return axios({
    url: api.getPersonList,
    method: 'get',
    params: parameter
  })
}

/**
 * 根据角色ID获取人员信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function getRolePersonList (parameter) {
  return axios({
    url: api.getRolePersonList,
    method: 'get',
    params: parameter
  })
}

/**
 * 更新角色人员信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function saveRolePerson (parameter) {
  return axios({
    url: api.saveRolePerson,
    method: 'post',
    data: parameter
  })
}

/**
 * 根据部门编码获取人员信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function getRoleOrgPersonList (parameter) {
  return axios({
    url: api.getOrgPersonList,
    method: 'get',
    params: parameter
  })
}

/**
 * 获取项目组成员人员选择列表
 * @param parameter
 * @returns {AxiosPromise}
 */

export function findPersonSelectList (parameter) {
  return axios({
    url: api.findPersonSelectList,
    method: 'get',
    params: parameter
  })
}

/**
 * 获取所有菜单及按钮，角色所拥有的菜单、及操作权限
 * @param parameter
 * @returns {AxiosPromise}
 */
export function getRoleAuthList (parameter) {
  return axios({
    url: api.getMenuAuthList,
    method: 'get',
    params: parameter
  })
}

/**
 * 更新角色拥有的菜单及操作权限
 * @param parameter
 * @returns {AxiosPromise}
 */
export function saveRoleAuth (parameter) {
  return axios({
    url: api.saveMenuAuth,
    method: 'post',
    data: parameter
  })
}

export function getDeptTree (parameter) {
  return axios({
    url: api.getDeptTree,
    method: 'get',
    params: parameter
  })
}
