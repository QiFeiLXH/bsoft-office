import { axios } from '@/utils/request'

const api = {
  /* 项目奖金 */
  projectLevelBonusAllSubtotal: '/bonusreport/pbonus/allsubtotal',
  projectLevelBonusAllSubtotalExport: '/bonusreport/pbonus/allsubtotaldownload',
  projectLevelBonusAllYear: '/bonusreport/pbonus/allyear',
  projectLevelBonusAllYearExport: '/bonusreport/pbonus/allyeardownload',
  projectLevelBonusAllMonth: '/bonusreport/pbonus/allmonth',
  projectLevelBonusAllMonthExport: '/bonusreport/pbonus/allmonthdownload',
  projectLevelBonusDepSubtotal: '/bonusreport/pbonus/depsubtotal',
  projectLevelBonusDepSubtotalExport: '/bonusreport/pbonus/depsubtotalDownload',
  projectLevelBonusDepYear: '/bonusreport/pbonus/depyear',
  projectLevelBonusDepYearExport: '/bonusreport/pbonus/depyeardownload',
  projectLevelBonusDepMonth: '/bonusreport/pbonus/depmonth',
  projectLevelBonusDepMonthExport: '/bonusreport/pbonus/depmonthdownload',

  contractLevelBonusAllSubtotal: '/bonusreport/cbonus/allsubtotal',
  contractLevelBonusAllSubtotalExport: '/bonusreport/cbonus/allsubtotaldownload',
  contractLevelBonusAllYear: '/bonusreport/cbonus/allyear',
  contractLevelBonusAllYearExport: '/bonusreport/cbonus/allyeardownload',
  contractLevelBonusAllMonth: '/bonusreport/cbonus/allmonth',
  contractLevelBonusAllMonthExport: '/bonusreport/cbonus/allmonthdownload',
  contractLevelBonusDepSubtotal: '/bonusreport/cbonus/depsubtotal',
  contractLevelBonusDepSubtotalExport: '/bonusreport/cbonus/depsubtotalDownload',
  contractLevelBonusDepYear: '/bonusreport/cbonus/depyear',
  contractLevelBonusDepYearExport: '/bonusreport/cbonus/depyeardownload',
  contractLevelBonusDepMonth: '/bonusreport/cbonus/depmonth',
  contractLevelBonusDepMonthExport: '/bonusreport/cbonus/depmonthdownload'
}

/** E01 项目奖金-项目级-全部-小计 */
export function getProjectLevelBonusAllSubtotal (parameter) {
  return axios({
    url: api.projectLevelBonusAllSubtotal,
    method: 'get',
    params: parameter
  })
}

/* E01 项目奖金-项目级-全部-小计   导出excel */
export function exportProjectLevelBonusAllSubtotal (parameter) {
  return axios({
    url: api.projectLevelBonusAllSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E02 项目奖金-项目级-全部-年度 */
export function getProjectLevelBonusAllYear (parameter) {
  return axios({
    url: api.projectLevelBonusAllYear,
    method: 'get',
    params: parameter
  })
}

/** E02 项目奖金-项目级-全部-年度   导出excel */
export function exportProjectLevelBonusAllYear (parameter) {
  return axios({
    url: api.projectLevelBonusAllYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E03 项目奖金-项目级-全部-月度 */
export function getProjectLevelBonusAllMonth (parameter) {
  return axios({
    url: api.projectLevelBonusAllMonth,
    method: 'get',
    params: parameter
  })
}

/** E03 项目奖金-项目级-全部-月度   导出excel */
export function exportProjectLevelBonusAllMonth (parameter) {
  return axios({
    url: api.projectLevelBonusAllMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E04 项目奖金-项目级-按产生部门类别-小计 */
export function getProjectLevelBonusDepSubtotal (parameter) {
  return axios({
    url: api.projectLevelBonusDepSubtotal,
    method: 'get',
    params: parameter
  })
}

/** E04 项目奖金-项目级-按产生部门类别-小计   导出excel */
export function exportProjectLevelBonusDepSubtotal (parameter) {
  return axios({
    url: api.projectLevelBonusDepSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E05 项目奖金-项目级-按产生部门类别-年度 */
export function getProjectLevelBonusDepYear (parameter) {
  return axios({
    url: api.projectLevelBonusDepYear,
    method: 'get',
    params: parameter
  })
}

/** E05 项目奖金-项目级-按产生部门类别-年度   导出excel */
export function exportProjectLevelBonusDepYear (parameter) {
  return axios({
    url: api.projectLevelBonusDepYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E06 项目奖金-项目级-按产生部门类别-月度 */
export function getProjectLevelBonusDepMonth (parameter) {
  return axios({
    url: api.projectLevelBonusDepMonth,
    method: 'get',
    params: parameter
  })
}

/** E06 项目奖金-项目级-按产生部门类别-月度   导出excel */
export function exportProjectLevelBonusDepMonth (parameter) {
  return axios({
    url: api.projectLevelBonusDepMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E07 项目奖金-合同级-全部-小计 */
export function getContractLevelBonusAllSubtotal (parameter) {
  return axios({
    url: api.contractLevelBonusAllSubtotal,
    method: 'get',
    params: parameter
  })
}

/** E07 项目奖金-合同级-全部-小计   导出excel */
export function exportContractLevelBonusAllSubtotal (parameter) {
  return axios({
    url: api.contractLevelBonusAllSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E08 项目奖金-合同级-全部-年度 */
export function getContractLevelBonusAllYear (parameter) {
  return axios({
    url: api.contractLevelBonusAllYear,
    method: 'get',
    params: parameter
  })
}

/** E08 项目奖金-合同级-全部-年度   导出excel */
export function exportContractLevelBonusAllYear (parameter) {
  return axios({
    url: api.contractLevelBonusAllYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E09 项目奖金-合同级-全部-月度 */
export function getContractLevelBonusAllMonth (parameter) {
  return axios({
    url: api.contractLevelBonusAllMonth,
    method: 'get',
    params: parameter
  })
}

/** E09 项目奖金-合同级-全部-月度   导出excel */
export function exportContractLevelBonusAllMonth (parameter) {
  return axios({
    url: api.contractLevelBonusAllMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E10 项目奖金-合同级-按产生部门类别-小计 */
export function getContractLevelBonusDepSubtotal (parameter) {
  return axios({
    url: api.contractLevelBonusDepSubtotal,
    method: 'get',
    params: parameter
  })
}

/** E10 项目奖金-合同级-按产生部门类别-小计   导出excel */
export function exportContractLevelBonusDepSubtotal (parameter) {
  return axios({
    url: api.contractLevelBonusDepSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E11 项目奖金-合同级-按产生部门类别-年度 */
export function getContractLevelBonusDepYear (parameter) {
  return axios({
    url: api.contractLevelBonusDepYear,
    method: 'get',
    params: parameter
  })
}

/** E11 项目奖金-合同级-按产生部门类别-年度   导出excel */
export function exportContractLevelBonusDepYear (parameter) {
  return axios({
    url: api.contractLevelBonusDepYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** E12 项目奖金-合同级-按产生部门类别-月度 */
export function getContractLevelBonusDepMonth (parameter) {
  return axios({
    url: api.contractLevelBonusDepMonth,
    method: 'get',
    params: parameter
  })
}

/** E12 项目奖金-合同级-按产生部门类别-月度   导出excel */
export function exportContractLevelBonusDepMonth (parameter) {
  return axios({
    url: api.contractLevelBonusDepMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
