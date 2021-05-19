import { axios } from '@/utils/request'

const api = {
  getprojectproductviews: '/projectproductview/getprojectproductviews',

}


/**
 * 项目上报维护模块列表查询
 * @returns {AxiosPromise}
 */
export function getprojectproductviews (parameter) {
  return axios({
    url: api.getprojectproductviews,
    method: 'get',
    params: parameter

  })
}


