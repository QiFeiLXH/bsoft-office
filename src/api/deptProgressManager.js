import { axios } from '@/utils/request'

const api = {
  deptQuery: '/deptprogress/query',
  deptHead: '/deptprogress/header',
  deptProgressManagerSave: '/deptprogress/save'
}

/* 部门进度列表查询 */
export function loadDeptManagerList (parameter) {
  return axios({
    url: api.deptQuery,
    method: 'get',
    params: parameter
  })
}

export function doLoadDeptManagerHead (parameter) {
  return axios({
    url: api.deptHead,
    method: 'get',
    params: parameter
  })
}

export function doSaveDeptProgressManager (parameter) {
  return axios({
    url: api.deptProgressManagerSave,
    method: 'post',
    data: parameter
  })
}
