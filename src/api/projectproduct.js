import { axios } from '@/utils/request'

const api = {
  getprojectproducts: '/projectproduct/getprojectproducts',
  saveprojectproducts: '/projectproduct/saveprojectproducts',
  submitprojectproducts: '/projectproduct/submitprojectproducts',
  getconstructiontypelist:'/publicapi/getconstructiontypelist',
}


/**
 * 项目上报维护产品模块列表查询
 * @returns {AxiosPromise}
 */
export function getprojectproducts (parameter) {
  return axios({
    url: api.getprojectproducts,
    method: 'get',
    params: parameter

  })}

/**
 * 承建分工类型列表查询
 * @returns {AxiosPromise}
 */
export function getconstructiontypelist (parameter) {
  return axios({
    url: api.getconstructiontypelist,
    method: 'get',
    params: parameter

  })}


/**
 * 项目上报维护产品模块更新
 * @returns {AxiosPromise}
 */
export function saveprojectproducts (parameter) {
  return axios({
    url: api.saveprojectproducts,
    method: 'post',
    data: parameter

  })}


/**
 * 项目上报维护产品模块提交
 * @returns {AxiosPromise}
 */
export function submitprojectproducts (parameter) {
  return axios({
    url: api.submitprojectproducts,
    method: 'post',
    data: parameter

  })}

