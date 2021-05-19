import { axios } from '@/utils/request'

const api = {
  regionQuery: '/regionprogress/query',
  logoutRegion: '/regionprogress/logout',
  enableRegion: '/regionprogress/enable',
  saveRegions: '/regionprogress/save',
  deptQuery: '/regionprogress/deptquery',
  deptHead: '/regionprogress/header',
  regionDic: '/regionprogress/regiondic'
}

/* 区域进度列表查询 */
export function loadRegionManagerList (parameter) {
  return axios({
    url: api.regionQuery,
    method: 'get',
    params: parameter
  })
}

/* 注销区域 */
export function logoutRegion (parameter) {
  return axios({
    url: api.logoutRegion,
    method: 'get',
    params: parameter
  })
}

/* 启用区域 */
export function enableRegion (parameter) {
  return axios({
    url: api.enableRegion,
    method: 'get',
    params: parameter
  })
}

/* 保存区域 */
export function saveRegions (parameter) {
  return axios({
    url: api.saveRegions,
    method: 'post',
    data: parameter
  })
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

export function doLoadRegionDic (parameter) {
  return axios({
    url: api.regionDic,
    method: 'get',
    params: parameter
  })
}
