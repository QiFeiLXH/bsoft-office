import { axios } from '@/utils/request'
const qs = require('qs')

const api = {
  dutyQuery: '/dutymaintain/duty',
  dutyInfo: '/dutymaintain/dutyinfo',
  customerSelect: '/dutymaintain/customerselect',
  proejctRegion: '/dutymaintain/projectregion',
  proejctSelect: '/dutymaintain/projectselect',
  proejctDutyNoQuery: '/dutymaintain/dutynameno',
  dutyDelete: '/dutymaintain/dutydelete',
  dutySave: '/dutymaintain/dutysave',
  milepostQuery: 'dutymaintain/milepost',
  milepostSave: 'dutymaintain/milepostsave',
  loadStageDocumentHeader: '/dutymaintain/loadstagedocumentheader',
  loadStageDocument: '/dutymaintain/loadstagedocument',
  backMoneyQuery: '/dutymaintain/payment',
  backMoneySave: '/dutymaintain/paymentsave'
}

/* 责任书维护-列表查询 */
export function loadDutyMaintainQueryList (parameter) {
  return axios({
    url: api.dutyQuery,
    method: 'post',
    data: parameter
  })
}

/* 责任书维护-基本信息-客户选择查询 */
export function loadCustomerSelectList (parameter) {
  return axios({
    url: api.customerSelect,
    method: 'get',
    params: parameter
  })
}

/* 责任书维护-责任书详情查询 */
export function loadProjectDutyInfo (parameter) {
  return axios({
    url: api.dutyInfo,
    method: 'get',
    params: parameter
  })
}

/* 责任书维护-基本信息-项目范围列表查询 */
export function loadProjectRegionList (parameter) {
  return axios({
    url: api.proejctRegion,
    method: 'get',
    params: parameter
  })
}

/* 责任书维护-基本信息-项目范围选择查询 */
export function loadProjectSelectList (parameter) {
  return axios({
    url: api.proejctSelect,
    method: 'get',
    params: parameter
  })
}

/* 责任书维护-责任书名称编号查询 */
export function loadProjectDutyNameNoQuery (parameter) {
  return axios({
    url: api.proejctDutyNoQuery,
    method: 'get',
    params: parameter
  })
}

/* 责任书维护-删除责任书 */
export function doDeleteProjectDuty (parameter) {
  return axios({
    url: api.dutyDelete,
    method: 'delete',
    params: parameter
  })
}

/* 责任书维护-保存责任书 */
export function doSaveProjectDuty (parameter) {
  return axios({
    url: api.dutySave,
    method: 'post',
    data: parameter
  })
}

/* 责任书维护-里程碑查询 */
export function loadProjectDutyMilepost (parameter) {
  return axios({
    url: api.milepostQuery,
    method: 'get',
    params: parameter
  })
}

/* 责任书维护-里程碑保存 */
export function doSaveProjectDutyMilepost (parameter) {
  return axios({
    url: api.milepostSave,
    method: 'post',
    data: parameter.saves,
    params: { deletes: parameter.deletes },
  })
}

/** 文档、里程碑表头查询   */
export function loadStageDocumentHeader (parameter) {
  return axios({
    url: api.loadStageDocumentHeader,
    method: 'get',
    params: parameter
  })
}

/** 文档、里程碑查询 */
export function loadStageDocument (parameter) {
  return axios({
    url: api.loadStageDocument,
    method: 'get',
    params: parameter
  })
}

/** 回款查询 */
export function loadBackMoneyList (parameter) {
  return axios({
    url: api.backMoneyQuery,
    method: 'get',
    params: parameter
  })
}

/** 回款查询 */
export function doSaveBackMoneyList (parameter) {
  return axios({
    url: api.backMoneySave,
    method: 'post',
    data: parameter.saves,
    params: { deletes: parameter.deletes },
  })
}
