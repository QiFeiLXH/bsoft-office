import { axios } from '@/utils/request'
const base = ''
// let base = 'http://127.0.0.1:8080'
const api = {
  // worklog: '/worklog'
  worklog: `${base}/workLogAudit/hello`
}

export default api

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
    url: `${base}/logquery/initpage`,
    method: 'get',
    params: parameter
  })
  // return axios.post(`${base}/workLogAudit/getAllWorkLogs`,parameter).then(res => res)
}
