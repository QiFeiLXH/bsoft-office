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

export function initpage (parameter) {
  return axios({
    url: `${base}/workLogAudit/initpage`,
    method: 'get',
    params: parameter
  })
  // return axios.post(`${base}/workLogAudit/getAllWorkLogs`,parameter).then(res => res)
}
