import { axios } from '@/utils/request'

const api = {
  getProjectWordCountViewList: '/progressfile/list',

}


export function getProjectWordCountViewList (parameter) {
  return axios({
    url: api.getProjectWordCountViewList,
    method: 'get',
    params: parameter,
  })
}
