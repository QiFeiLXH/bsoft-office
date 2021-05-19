import { axios } from '@/utils/request'
const base = ''
// let base = 'http://127.0.0.1:8080'
const api = {
  // worklog: '/worklog'
  worklog: `${base}/workLogAudit/hello`
}

export default api

export function getWorkLogList (parameter) {
  return axios({
    url: `${base}/workLogAudit/getAllWorkLogs`,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
  // return axios.post(`${base}/workLogAudit/getAllWorkLogs`,parameter).then(res => res)
}

export function searchWorkLogList (parameter) {
  return axios({
    url: `${base}/workLogAudit/getAllWorkLogs`,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
  // return axios.post(`${base}/workLogAudit/getAllWorkLogs`,parameter).then(res => res)
}

export function saveWorkLogDetails (parameter) {
  return axios({
    url: `${base}/workLogAudit/saveWorkLogDetails`,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function getWorkLogById (parameter) {
  return axios({
    url: `${base}/workLogAudit/getWorkLogById`,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function saveWorkLog (parameter) {
  return axios({
    url: `${base}/workLogAudit/saveWorkLog`,
    method: 'post',
    data: parameter
  })
}

export function getProjectWithAuditList (parameter) {
  return axios({
    url: `${base}/workLogAudit/getProjectWithAuditList`,
    method: 'post',
    data: parameter
  })
}

/* 获取项目日志查询登录人员填写日志或者项目经理管理的项目 */
export function getProjectsWithLogsnum (parameter) {
  return axios({
    url: `${base}/logquery/projectswithlogsnum`,
    method: 'post',
    data: parameter
  })
}

/* 获取登录人员填写日志或者项目经理管理的项目下的项目日志概要 */
export function getProjectLogSummary (parameter) {
  return axios({
    url: `${base}/logquery/projectlogssummary`,
    method: 'post',
    params: { inputContent: parameter.inputContent, projectId: parameter.projectId },
    data: parameter
  })
}


export function initpage (parameter) {
  return axios({
    url: `${base}/workLogAudit/initpage`,
    method: 'get',
    params: parameter
  })
  // return axios.post(`${base}/workLogAudit/getAllWorkLogs`,parameter).then(res => res)
}


/* 获取项目选择列表 */
export function searchProjects (parameter) {
  return axios({
    url: `${base}/workLogAudit/searchprojects`,
    method: 'get',
    params: parameter
  })
}

/* 获取项目计划树 */
export function doLoadProjectPlanTree (parameter) {
  return axios({
    url: `${base}/workLogAudit/plantree`,
    method: 'get',
    params: parameter
  })
}