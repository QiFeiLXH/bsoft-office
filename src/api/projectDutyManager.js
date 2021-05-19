import { axios } from '@/utils/request'

const api = {
  dutyQuery: '/dutymanager/query',
  auditDutyList: '/dutymanager/audit',
  exortDutyList: '/dutymanager/dutydownload'
}

/* 责任书管理-列表查询 */
export function loadDutyAuditQueryList (parameter) {
  return axios({
    url: api.dutyQuery,
    method: 'post',
    data: parameter
  })
}

/* 责任书管理-审核 */
export function auditDutyList (parameter) {
  return axios({
    url: api.auditDutyList,
    method: 'post',
    data: parameter
  })
}

/* 责任书管理   导出excel */
export function exportDutyAuditList (parameter) {
  return axios({
    url: api.exortDutyList,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
