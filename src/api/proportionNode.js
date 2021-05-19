import { axios } from '@/utils/request'

const api = {
  getproprogressnodelist: '/proprogressnode/getproprogressnodelist',
  saveproprogressnodelist: '/proprogressnode/saveproprogressnodelist',
  logoutproprogressnode:'/proprogressnode/logoutproprogressnode',
}


/**
 * 项目模块列表新增
 * @param parameter
 * @returns {AxiosPromise}
 */
export function saveproprogressnodelist (parameter) {
  return axios({
    url: api.saveproprogressnodelist,
    method: 'post',
    data: parameter
  })
}


/**
 * 项目模块注销
 * @param parameter
 * @returns {AxiosPromise}
 */
export function logoutproprogressnode (parameter) {
  return axios({
    url: api.logoutproprogressnode,
    method: 'get',
    params: parameter
  })
}

/**
 * 项目模块列表查询
 * @returns {AxiosPromise}
 */
export function getproprogressnodelist (parameter) {
  return axios({
    url: api.getproprogressnodelist,
    method: 'get',
    params: parameter

  })
}


