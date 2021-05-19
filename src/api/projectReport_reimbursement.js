import { axios } from '@/utils/request'

const api = {
  /** 报销费用  */
  costSubjectColumns: '/reimbursereport/costsubjectcolumns',
  projectLevelReimbursementCostAllSubtotal: '/reimbursereport/projectreimbursementcost/allsubtotal',
  projectLevelReimbursementCostAllSubtotalExport: '/reimbursereport/projectreimbursementcost/allsubtotaldownload',
  projectLevelReimbursementCostAllYear: '/reimbursereport/projectreimbursementcost/allyear',
  projectLevelReimbursementCostAllYearExport: '/reimbursereport/projectreimbursementcost/allyeardownload',
  projectLevelReimbursementCostAllMonth: '/reimbursereport/projectreimbursementcost/allmonth',
  projectLevelReimbursementCostAllMonthExport: '/reimbursereport/projectreimbursementcost/allmonthdownload',
  projectLevelReimbursementCostDepSubtotal: '/reimbursereport/projectreimbursementcost/depsubtotal',
  projectLevelReimbursementCostDepSubtotalExport: '/reimbursereport/projectreimbursementcost/depsubtotaldownload',
  projectLevelReimbursementCostDepYear: '/reimbursereport/projectreimbursementcost/depyear',
  projectLevelReimbursementCostDepYearExport: '/reimbursereport/projectreimbursementcost/depyeardownload',
  projectLevelReimbursementCostDepMonth: '/reimbursereport/projectreimbursementcost/depmonth',
  projectLevelReimbursementCostDepMonthExport: '/reimbursereport/projectreimbursementcost/depmonthdownload',

  contractLevelReimbursementCostAllSubtotal: '/reimbursereport/contractreimbursementcost/allsubtotal',
  contractLevelReimbursementCostAllSubtotalExport: '/reimbursereport/contractreimbursementcost/allsubtotaldownload',
  contractLevelReimbursementCostAllYear: '/reimbursereport/contractreimbursementcost/allyear',
  contractLevelReimbursementCostAllYearExport: '/reimbursereport/contractreimbursementcost/allyeardownload',
  contractLevelReimbursementCostAllMonth: '/reimbursereport/contractreimbursementcost/allmonth',
  contractLevelReimbursementCostAllMonthExport: '/reimbursereport/contractreimbursementcost/allmonthdownload',
  contractLevelReimbursementCostDepSubtotal: '/reimbursereport/contractreimbursementcost/depsubtotal',
  contractLevelReimbursementCostDepSubtotalExport: '/reimbursereport/contractreimbursementcost/depsubtotaldownload',
  contractLevelReimbursementCostDepYear: '/reimbursereport/contractreimbursementcost/depyear',
  contractLevelReimbursementCostDepYearExport: '/reimbursereport/contractreimbursementcost/depyeardownload',
  contractLevelReimbursementCostDepMonth: '/reimbursereport/contractreimbursementcost/depmonth',
  contractLevelReimbursementCostDepMonthExport: '/reimbursereport/contractreimbursementcost/depmonthdownload'
}

/** 报销费用-费用科目 */
export function getCostSubjectCloumns (parameter) {
  return axios({
    url: api.costSubjectColumns,
    method: 'get',
    params: parameter
  })
}

/** D01 报销费用-项目级-全部-小计 */
export function findProjectLevelReimbursementCostAllSubtotal (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostAllSubtotal,
    method: 'get',
    params: parameter
  })
}

/* D01 报销费用-项目级-全部-小计   导出excel */
export function exportProjectLevelReimbursementCostAllSubtotal (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostAllSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D02 报销费用-项目级-全部-年度 */
export function findProjectLevelReimbursementCostAllYear (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostAllYear,
    method: 'get',
    params: parameter
  })
}

/** D02 报销费用-项目级-全部-年度   导出excel */
export function exportProjectLevelReimbursementCostAllYear (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostAllYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D03 报销费用-项目级-全部-月度 */
export function findProjectLevelReimbursementCostAllMonth (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostAllMonth,
    method: 'get',
    params: parameter
  })
}

/** D03 报销费用-项目级-全部-月度   导出excel */
export function exportProjectLevelReimbursementCostAllMonth (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostAllMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D04 报销费用-项目级-按产生部门类别-小计 */
export function findProjectLevelReimbursementCostDepSubTotal (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostDepSubtotal,
    method: 'get',
    params: parameter
  })
}

/** D04 报销费用-项目级-按产生部门类别-小计   导出excel */
export function exportProjectLevelReimbursementCostDepSubTotal (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostDepSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D05 报销费用-项目级-按产生部门类别-年度 */
export function findProjectLevelReimbursementCostDepYear (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostDepYear,
    method: 'get',
    params: parameter
  })
}

/** D05 报销费用-项目级-按产生部门类别-年度   导出excel */
export function exportProjectLevelReimbursementCostDepYear (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostDepYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D06 报销费用-项目级-按产生部门类别-月度 */
export function findProjectLevelReimbursementCostDepMonth (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostDepMonth,
    method: 'get',
    params: parameter
  })
}

/** D06 报销费用-项目级-按产生部门类别-月度   导出excel */
export function exportProjectLevelReimbursementCostDepMonth (parameter) {
  return axios({
    url: api.projectLevelReimbursementCostDepMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D07 报销费用-合同级-全部-小计 */
export function findContractLevelReimbursementCostAllSubTotal (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostAllSubtotal,
    method: 'get',
    params: parameter
  })
}

/** D07 报销费用-合同级-全部-小计   导出excel */
export function exportContractLevelReimbursementCostAllSubTotal (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostAllSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D08 报销费用-合同级-全部-年度 */
export function findContractLevelReimbursementCostAllYear (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostAllYear,
    method: 'get',
    params: parameter
  })
}

/** D08 报销费用-合同级-全部-年度   导出excel */
export function exportContractLevelReimbursementCostAllYear (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostAllYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D09 报销费用-合同级-全部-月度 */
export function findContractLevelReimbursementCostAllMonth (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostAllMonth,
    method: 'get',
    params: parameter
  })
}

/** D09 报销费用-合同级-全部-月度   导出excel */
export function exportContractLevelReimbursementCostAllMonth (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostAllMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D10 报销费用-合同级-按产生部门类别-小计 */
export function findContractLevelReimbursementCostDepSubTotal (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostDepSubtotal,
    method: 'get',
    params: parameter
  })
}

/** D10 报销费用-合同级-按产生部门类别-小计   导出excel */
export function exportContractLevelReimbursementCostDepSubTotal (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostDepSubtotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D11 报销费用-合同级-按产生部门类别-年度 */
export function findContractLevelReimbursementCostDepYear (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostDepYear,
    method: 'get',
    params: parameter
  })
}

/** D11 报销费用-合同级-按产生部门类别-年度   导出excel */
export function exportContractLevelReimbursementCostDepYear (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostDepYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/** D12 报销费用-合同级-按产生部门类别-月度 */
export function findContractLevelReimbursementCostDepMonth (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostDepMonth,
    method: 'get',
    params: parameter
  })
}

/** D12 报销费用-合同级-按产生部门类别-月度   导出excel */
export function exportContractLevelReimbursementCostDepMonth (parameter) {
  return axios({
    url: api.contractLevelReimbursementCostDepMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
