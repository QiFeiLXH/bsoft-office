import { axios } from '@/utils/request'

const api = {
  getDeptTree: '/publicapi/depttree',
  findPersonSelectList: '/publicapi/personselectlist',
  findPersonsWithPersonIds: '/publicapi/personswithpersonids',
  getDeptSelectTree: '/publicapi/deptselecttree',
  getPersonSelectList: '/publicapi/personselect',
  getPubDicList: '/publicapi/pubdiclist',
  getSysDicList: '/publicapi/sysdiclist',
  getHrDicList: '/publicapi/hrdiclist',

}

export function findPersonSelectList (parameter) {
  return axios({
    url: api.findPersonSelectList,
    method: 'get',
    params: parameter
  })
}

export function getPersonSelectList (parameter) {
  return axios({
    url: api.getPersonSelectList,
    method: 'get',
    params: parameter
  })
}

export function getDeptTree (parameter) {
  return axios({
    url: api.getDeptTree,
    method: 'get',
    params: parameter
  })
}

export function findPersonsWithPersonIds (parameter) {
  return axios({
    url: api.findPersonsWithPersonIds,
    method: 'get',
    params: parameter
  })
}

export function getDeptSelectTree (parameter) {
  return axios({
    url: api.getDeptSelectTree,
    method: 'get',
    params: parameter
  })
}

/** 公用代码字典列表*/
export function getPubDicList (parameter) {
  return axios({
    url: api.getPubDicList,
    method: 'get',
    params: parameter
  })
}

/** 系统代码字典列表*/
export function getSysDicList (parameter) {
  return axios({
    url: api.getSysDicList,
    method: 'get',
    params: parameter
  })
}

/** 人事代码字典列表*/
export function getHrDicList (parameter) {
  return axios({
    url: api.getHrDicList,
    method: 'get',
    params: parameter
  })
}
