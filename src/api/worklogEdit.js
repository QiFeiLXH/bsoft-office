import { axios } from '@/utils/request'
const base = ''
// let base = 'http://127.0.0.1:8080'
const api = {
  // worklog: '/worklog'
  worklog: `${base}/workLogEdit/hello`
}

export default api

export function getWorkLogList (parameter) {
  return axios({
    url: `${base}/workLogEdit/getAllWorkLogs`,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
  // return axios.post(`${base}/workLogEdit/getAllWorkLogs`,parameter).then(res => res)
}

export function saveWorkLogDetails (parameter) {
  return axios({
    url: `${base}/workLogEdit/saveWorkLogDetails`,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function getWorkLogById (parameter) {
  return axios({
    url: `${base}/workLogEdit/getWorkLogById`,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function saveWorkLog (parameter) {
  return axios({
    url: `${base}/workLogEdit/saveWorkLog`,
    method: 'post',
    data: parameter
  })
}

export function getProjectWithAuditList (parameter) {
  return axios({
    url: `${base}/workLogEdit/getProjectWithAuditList`,
    method: 'post',
    data: parameter
  })
}

export function initpage (parameter) {
  return axios({
    url: `${base}/workLogEdit/initpage`,
    method: 'get',
    params: parameter
  })
  // return axios.post(`${base}/workLogEdit/getAllWorkLogs`,parameter).then(res => res)
}

/* 获取项目选择列表 */
export function searchProjects (parameter) {
  return axios({
    url: `${base}/workLogEdit/searchprojects`,
    method: 'get',
    params: parameter
  })
}

/* 获取项目计划树 */
export function doLoadProjectPlanTree (parameter) {
  return axios({
    url: `${base}/workLogEdit/plantree`,
    method: 'get',
    params: parameter
  })
}
