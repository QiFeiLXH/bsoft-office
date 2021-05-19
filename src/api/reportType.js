import { axios } from '@/utils/request'

const api = {
  getproreporttypelist: '/proreporttype/getproreporttypelist',
  saveproreporttypelist: '/proreporttype/saveproreporttypelist',
  logoutproreporttype:'/proreporttype/logoutproreporttype',
}


/**
 * 项目模块列表新增
 * @param parameter
 * @returns {AxiosPromise}
 */
export function saveproreporttypelist (parameter) {
  return axios({
    url: api.saveproreporttypelist,
    method: 'post',
    data: parameter
  })
}


/**
 * 项目模块注销
 * @param parameter
 * @returns {AxiosPromise}
 */
export function logoutproreporttype (parameter) {
  return axios({
    url: api.logoutproreporttype,
    method: 'get',
    params: parameter
  })
}

/**
 * 项目模块列表查询
 * @returns {AxiosPromise}
 */
export function getproreporttypelist () {
  return axios({
    url: api.getproreporttypelist,
    method: 'get',
  })
}


