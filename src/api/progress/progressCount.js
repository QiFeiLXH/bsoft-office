import { axios } from '@/utils/request'

const api = {
  findlist: '/procount/list',
  getprojectlist : '/procount/projectlist',
  findtypelist: '/procount/typelist',
  gettypeandheader:'/procount/typeandheader',
  getcontypeandheader:'/procount/contypeandheader',
  getmonthreport: '/procount/monthreport',
  getconmonthreport: '/procount/conmonthreport',
}

export function progresslist (parameter) {
  return axios({
    url: api.findlist,
    method: 'post',
    data: parameter,
  })
}

export function getprojectlist (parameter) {
  return axios({
    url: api.getprojectlist,
    method: 'get',
    params: parameter,
  })
}

export function findtypelist (parameter) {
  return axios({
    url: api.findtypelist,
    method: 'get',
    params: parameter,
  })
}

export function gettypeandheader (parameter) {
  return axios({
    url: api.gettypeandheader,
    method: 'get',
    params: parameter,
  })
}

export function getcontypeandheader (parameter) {
  return axios({
    url: api.getcontypeandheader,
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

export function getconmonthreport (parameter) {
  return axios({
    url: api.getconmonthreport,
    method: 'get',
    params: parameter,
  })
}