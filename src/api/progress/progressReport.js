import { axios } from '@/utils/request'

const api = {
  findlist: '/progressrespot/list',
  getprogress: '/progressrespot/getprogress',
  findtypelist: '/progressrespot/typelist',
  findheader: '/progressrespot/header',
  getmonthreport: '/progressrespot/monthreport',
  report: '/progressrespot/report',
  checkhasprogress: '/progressrespot/checkreport',
  checkenablereport: '/progressrespot/checkenablereport',
  addprogress: '/progressrespot/addprogress',
  getWordDisplayList: "progressrespot/file/displaylist",
  getWordList: "progressrespot/file/list",
  getWordDetailList: "progressrespot/file/detaillist",
  getStandradWord: "progressrespot/file/standradword",
  uploadWord: "progressrespot/file/upload",
  downloadWord: "progressrespot/file/download",
  removeWord: "progressrespot/file/remove",
  getFinalCheckDate: "progressrespot/file/finalcheckdate",
  getOnlineDate: "progressrespot/file/onlinedate",
  getWordTypeList: "progressrespot/file/typelist",
}

export function checkhasprogress (parameter) {
  return axios({
    url: api.checkhasprogress,
    method: 'get',
    params: parameter,
  })
}
export function checkenablereport (parameter) {
  return axios({
    url: api.checkenablereport,
    method: 'get',
    params: parameter,
  })
}

export function getprogress (parameter) {
  return axios({
    url: api.getprogress,
    method: 'get',
    params: parameter,
  })
}

export function addprogress (parameter) {
  return axios({
    url: api.addprogress,
    method: 'get',
    params: parameter,
  })
}


export function findlist (parameter) {
  return axios({
    url: api.findlist,
    method: 'post',
    data: parameter,
  })
}

export function findtypelist (parameter) {
  return axios({
    url: api.findtypelist,
    method: 'get',
    params: parameter,
  })
}

export function findheader (parameter) {
  return axios({
    url: api.findheader,
    method: 'get',
    params: parameter,
  })
}

export function getmonthreport (parameter) {
  return axios({
    url: api.getmonthreport,
    method: 'get',
    params: parameter,
  })
}

export function report (parameter) {
  return axios({
    url: api.report,
    method: 'post',
    data: parameter,
  })
}

export function getWordDisplayList (parameter) {
  return axios({
    url: api.getWordDisplayList,
    method: 'GET',
    params: parameter,
  })
}

export function getWordList (parameter) {
  return axios({
    url: api.getWordList,
    method: 'GET',
    params: parameter,
  })
}

export function getWordDetailList (parameter) {
  return axios({
    url: api.getWordDetailList,
    method: 'GET',
    params: parameter,
  })
}

export function getStandradWord (parameter) {
  return axios({
    url: api.getStandradWord,
    method: 'GET',
    params: parameter,
  })
}

export function downloadWord(parameter) {
  return axios({
    url: api.downloadWord,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

export function uploadWord (parameter) {
  return axios({
    url: api.uploadWord,
    method: 'post',
    data: parameter,
  })
}

export function removeWord(parameter) {
  return axios({
    url: api.removeWord,
    method: 'get',
    params: parameter,
  })
}

export function getOnlineDate(parameter) {
  return axios({
    url: api.getOnlineDate,
    method: 'get',
    params: parameter,
  })
}

export function getFinalCheckDate(parameter) {
  return axios({
    url: api.getFinalCheckDate,
    method: 'get',
    params: parameter,
  })
}

export function getWordTypeList(parameter) {
  return axios({
    url: api.getWordTypeList,
    method: 'get',
    params: parameter,
  })
}