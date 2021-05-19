import { axios } from '@/utils/request'

const api = {
  getreportcountview: '/reportcount/getreportcountview',

}


/**
 * 项目上报统计
 * @returns {AxiosPromise}
 */
export function getreportcountview (parameter) {
  return axios({
    url: api.getreportcountview,
    method: 'get',
    params: parameter

  })}





