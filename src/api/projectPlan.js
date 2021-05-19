import { axios } from '@/utils/request'
const qs = require('qs')
const base = ''
// let base = 'http://127.0.0.1:8080'
const api = {
  getList: '/projectplan/getlist',
  getDetail: '/projectplan/getdetail',
  saveAll: '/projectplan/saveall',
  planHaveWorkLog: '/projectplan/planhaveworklog',
  groupsTree: '/projectplan/groupstree',
  deleteTreeNode: '/projectplan/deletetreenode',
  saveTreeNode: '/projectplan/savetreenode/',
  membersList: '/projectplan/memberslist',
  conditionalMembers: '/projectplan/conditionalmembers/',
  saveMembers: '/projectplan/savemembers/',
  getStandardWord: '/projectplan/getstandardword/',
  getDutyMilepost:'/projectplan/dutymilepost/',
  getMilepostWordNums:'/projectplan/milepostwordnums/',
  getFileTypes:'/projectplan/getfileuploadtype/',
  loadStageDocumentHeader: '/projectplan/loadstagedocumentheader',
  loadStageDocument: '/projectplan/loadstagedocument'
}

export function getProjectHavePlanList (parameter) {
  return axios({
    url: `${base}` + api.getList,
    method: 'get',
    params: parameter
  })
}

export function findPlanDetailByPlanId (parameter) {
  return axios({
    url: `${base}` + api.getDetail,
    method: 'get',
    params: parameter
  })
}

export function saveAllProjectPlanDetail (parameter) {
  return axios({
    url: `${base}` + api.saveAll,
    method: 'post',
    data: parameter
  })
}

export function planHaveWorkLog (parameter) {
  return axios({
    url: `${base}` + api.planHaveWorkLog,
    method: 'post',
    data: parameter
  })
}

/* 获取项目计划-成员管理项目经理项目分组树 */
export function doLoadProjectGroupTree (parameter) {
  return axios({
    url: `${base}` + api.groupsTree,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 项目计划-删除项目分组节点 */
export function doDeleteProjectGroupNode (parameter) {
  return axios({
    url: `${base}` + api.deleteTreeNode,
    method: 'delete',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 项目计划-新增、修改项目分组节点 */
export function doSaveProjectGroupNode (parameter) {
  return axios({
    url: `${base}` + api.saveTreeNode + parameter.flag,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 项目计划-获取项目组成员列表 */
export function doQueryGroupMemebersList (parameter) {
  return axios({
    url: `${base}` + api.membersList,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 项目计划-查找指定条件的项目组成员 */
export function doQueryGroupMemebers (parameter) {
  return axios({
    url: `${base}` + api.conditionalMembers + parameter.contractNo,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 项目计划-批量新增（修改/删除）项目组成员 */
export function doSaveProjectGroupMembers (parameter) {
  return axios({
    url: `${base}` + api.saveMembers + parameter.contractNo,
    method: 'post',
    params: { deleteList: parameter.deleteList, updateList: parameter.updateLeaderList },
    data: parameter.saveList,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
  })
}

export function getStandardWord (parameter) {
  return axios({
    url: `${base}` + api.getStandardWord,
    method: 'post',
    data: parameter
  })
}

export function getDutyMilepostList (parameter) {
  return axios({
    url: `${base}` + api.getDutyMilepost,
    method: 'get',
    params: parameter
  })
}

export function getMilepostWordNums (parameter) {
  return axios({
    url: `${base}` + api.getMilepostWordNums,
    method: 'get',
    params: parameter
  })
}

export function getFileTypes (parameter) {
  return axios({
    url: `${base}` + api.getFileTypes,
    method: 'get',
    params: parameter
  })
}

export function loadStageDocumentHeaderWithPlan (parameter) {
  return axios({
    url: `${base}` + api.loadStageDocumentHeader,
    method: 'get',
    params: parameter
  })
}

export function loadStageDocumentWithPlan (parameter) {
  return axios({
    url: `${base}` + api.loadStageDocument,
    method: 'get',
    params: parameter
  })
}