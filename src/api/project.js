import { axios } from '@/utils/request'

const api = {
  ownLastProject: '/projectlog/ownlastproject',
  searchProjects: '/projectlog/searchprojects',
  ownWorkLogs: '/projectlog/ownworklogs',
  initPage: '/projectlog/initpage',
  saveWorkLogs: '/projectlog/saveworklogs',
  deleteProjectLog: '/projectlog/deleteprojectlog',
  refreshPlanTree: '/projectlog/refreshplantree',
  loadProjectWordList: '/projectlog/loadprojectwordlist',
  loadProjectWordDetails: '/projectlog/loadprojectworddetails',
  fileUpload: '/projectlog/fileupload',
  fileDownload: '/projectlog/filedownload',
  fileDelete: '/projectlog/filedelete',
  referenceDownload: '/projectlog/referencedownload',
  searchHouses: '/projectlog/searchhouses',
  ownAttendance: '/projectlog/ownattendance',
  uploadTypes: '/projectlog/uploadtypes',
  loadStageDocumentHeader: '/projectlog/loadstagedocumentheader',
  loadStageDocument: '/projectlog/loadstagedocument',
  milepostPlanFinished: '/projectlog/milepostplanfinished',
}
const base = ''
export default api

// 初始化页面
export function initPage (parameter) {
  return axios({
    // url: api.initPage,
    url: `${base}` + api.initPage,
    method: 'get',
    params: parameter
  })
}

export function ownAttendance (parameter) {
  return axios({
    url: `${base}` + api.ownAttendance,
    method: 'get',
    params: parameter
  })
}

export function milepostPlanFinished (parameter) {
  return axios({
    url: `${base}` + api.milepostPlanFinished,
    method: 'get',
    params: parameter
  })
}

export function loadStageDocumentHeader (parameter) {
  return axios({
    url: `${base}` + api.loadStageDocumentHeader,
    method: 'get',
    params: parameter
  })
}

export function loadStageDocument (parameter) {
  return axios({
    url: `${base}` + api.loadStageDocument,
    method: 'get',
    params: parameter
  })
}

export function uploadTypes (parameter) {
  return axios({
    url: `${base}` + api.uploadTypes,
    method: 'get',
    params: parameter
  })
}

// 获取项目计划树
export function refreshPlanTree (parameter) {
  return axios({
    url: `${base}` + api.refreshPlanTree,
    method: 'get',
    params: parameter
  })
}

export function getOwnLastProject (parameter) {
  return axios({
    url: `${base}` + api.ownLastProject,
    method: 'get',
    params: parameter,
  })
}

export function searchProjects (parameter) {
  return axios({
    url: `${base}` + api.searchProjects,
    method: 'get',
    params: parameter
  })
}

export function searchHouses (parameter) {
  return axios({
    url: `${base}` + api.searchHouses,
    method: 'get',
    params: parameter
  })
}

export function getOwnWorkLogs (parameter) {
  return axios({
    url: `${base}` + api.ownWorkLogs,
    method: 'get',
    params: parameter
  })
}

export function saveWorkLogs (parameter) {
  return axios({
    url: `${base}` + api.saveWorkLogs,
    method: 'post',
    data: parameter,
  })
}

export function deleteProjectLog (parameter) {
  return axios({
    url: `${base}` + api.deleteProjectLog,
    method: 'delete',
    params: parameter,
  })
}

export function loadProjectWordList (parameter) {
  return axios({
    url: `${base}` + api.loadProjectWordList,
    method: 'get',
    params: parameter
  })
}

export function loadProjectWordDetails (parameter) {
  return axios({
    url: `${base}` + api.loadProjectWordDetails,
    method: 'get',
    params: parameter
  })
}

export function fileUpload (parameter) {
  return axios({
    url: `${base}` + api.fileUpload,
    method: 'post',
    data: parameter,
  })
}

export function fileDownload(parameter) {
  return axios({
    url: `${base}` + api.fileDownload,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

export function referenceDownload(parameter) {
  return axios({
    url: `${base}` + api.referenceDownload,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

export function fileDelete(parameter) {
  return axios({
    url: `${base}` + api.fileDelete,
    method: 'delete',
    params: parameter,
  })
}
