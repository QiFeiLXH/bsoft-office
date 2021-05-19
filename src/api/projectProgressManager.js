import { axios } from '@/utils/request'

const api = {
  projectQuery: '/projectprogress/query',
  projectProgressSave: '/projectprogress/save'
}

/* 项目进度管理员列表查询 */
export function loadProjectManagerList (parameter) {
  return axios({
    url: api.projectQuery,
    method: 'get',
    params: parameter
  })
}

/* 项目进度管理保存 */
export function doSaveProjectProgressManager (parameter) {
  return axios({
    url: api.projectProgressSave,
    method: 'post',
    data: parameter
  })
}
