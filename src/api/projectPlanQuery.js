import { axios } from '@/utils/request'

const api = {
  planList: '/planquery/planlist',
  planTree: '/planquery/plantree',
  worklogList: '/planquery/workloglist',
  worklogInfo: '/planquery/workloginfo',
  initPage: '/planquery/initpage'
}
const base = ''
export default api

/* 获取项目计划查询列表 */
export function doLoadProjectPlanQueryList (parameter) {
  return axios({
    url: `${base}` + api.planList,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 获取项目计划查询-项目计划树 */
export function doLoadProjectPlanQueryTree (parameter) {
  return axios({
    url: `${base}` + api.planTree,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 获取项目计划查询-项目日志列表 */
export function doLoadProjectWorklogList (parameter) {
  return axios({
    url: `${base}` + api.worklogList,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 获取项目计划查询-项目日志详情 */
export function doLoadWorklogInfo (parameter) {
  return axios({
    url: `${base}` + api.worklogInfo,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function initpage (parameter) {
  return axios({
    url: `${base}` + api.initPage,
    method: 'get',
    params: parameter
  })
}
