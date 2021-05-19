import { axios } from '@/utils/request'

const api = {
  groupsTree: '/projectgroup/groupstree',
  deleteTreeNode: '/projectgroup/deletetreenode',
  saveTreeNode: '/projectgroup/savetreenode/',
  membersList: '/projectgroup/memberslist',
  conditionalMembers: '/projectgroup/conditionalmembers/',
  saveMembers: '/projectgroup/savemembers/',
  projectList: '/projectgroup/projectlist'
}
const base = ''
const qs = require('qs')

export default api

/* 成员维护-获取组员维护组长项目分组树 */
export function doLoadLeaderSelfProjectGroupTree (parameter) {
  return axios({
    url: `${base}` + api.groupsTree,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/* 成员维护-删除项目分组节点 */
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

/* 成员维护-新增、修改项目分组节点 */
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

/* 成员维护-获取项目组成员列表 */
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

/* 成员维护-查找指定条件的项目组成员 */
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

/* 成员维护-批量新增（修改/删除）项目组成员 */
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

/* 成员维护-组长所属项目列表 */
export function doLoadLeaderSelfProjects (parameter) {
  return axios({
    url: `${base}` + api.projectList,
    method: 'get',
    params: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
