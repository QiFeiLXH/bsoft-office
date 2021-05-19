import { axios } from '@/utils/request'

const api = {
  /** 全部 */
  projectLevelAllSubTotal: '/allreport/allproject/allsubtotal',
  projectLevelAllSubTotalExport: '/allreport/allproject/allsubtotaldownload',
  projectLevelAllYear: '/allreport/allproject/allyear',
  projectLevelAllYearExport: '/allreport/allproject/allyeardownload',
  projectLevelAllMonth: '/allreport/allproject/allmonth',
  projectLevelAllMonthExport: '/allreport/allproject/allmonthdownload',
  projectLevelAllDepSubTotal: '/allreport/allproject/alldepsubtotal',
  projectLevelAllDepSubTotalExport: '/allreport/allproject/alldepsubtotaldownload',
  projectLevelAllDepYear: '/allreport/allproject/alldepyear',
  projectLevelAllDepYearExport: '/allreport/allproject/alldepyeardownload',
  projectLevelAllDepMonth: '/allreport/allproject/alldepmonth',
  projectLevelAllDepMonthExport: '/allreport/allproject/alldepmonthdownload',

  contractLevelAllSubTotal: '/allreport/allcontract/allsubtotal',
  contractLevelAllSubTotalExport: '/allreport/allcontract/allsubtotaldownload',
  contractLevelAllYear: '/allreport/allcontract/allyear',
  contractLevelAllYearExport: '/allreport/allcontract/allyeardownload',
  contractLevelAllMonth: '/allreport/allcontract/allmonth',
  contractLevelAllMonthExport: '/allreport/allcontract/allmonthdownload',
  contractLevelAllDepSubTotal: '/allreport/allcontract/alldepsubtotal',
  contractLevelAllDepSubTotalExport: '/allreport/allcontract/alldepsubtotaldownload',
  contractLevelAllDepYear: '/allreport/allcontract/alldepyear',
  contractLevelAllDepYearExport: '/allreport/allcontract/alldepyeardownload',
  contractLevelAllDepMonth: '/allreport/allcontract/alldepmonth',
  contractLevelAllDepMonthExport: '/allreport/allcontract/alldepmonthdownload',

}
/* A01 项目级-全部-小计 */
export function doLoadProjectAllSubTotal (parameter) {
  return axios({
    url: api.projectLevelAllSubTotal,
    method: 'get',
    params: parameter
  })
}

/* A01 项目级-全部-小计   导出excel */
export function exportProjectAllSubTotal (parameter) {
  return axios({
    url: api.projectLevelAllSubTotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A02 项目级-全部-年度 */
export function doLoadProjectAllSubTotalYear (parameter) {
  return axios({
    url: api.projectLevelAllYear,
    method: 'get',
    params: parameter
  })
}

/* A02 项目级-全部-年度   导出excel  */
export function exportProjectAllSubTotalYear (parameter) {
  return axios({
    url: api.projectLevelAllYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A03 项目级-全部-月度 */
export function doLoadProjectAllSubTotalMonth (parameter) {
  return axios({
    url: api.projectLevelAllMonth,
    method: 'get',
    params: parameter
  })
}

/* A03 项目级-全部-月度   导出excel  */
export function exportProjectAllSubTotalMonth (parameter) {
  return axios({
    url: api.projectLevelAllMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A04 项目级-全部-按产生部门类别-小计 */
export function doLoadProjectAllDepSubTotal (parameter) {
  return axios({
    url: api.projectLevelAllDepSubTotal,
    method: 'get',
    params: parameter
  })
}

/* A04 项目级-全部-按产生部门类别-小计   导出excel  */
export function exportProjectAllDepSubTotal (parameter) {
  return axios({
    url: api.projectLevelAllDepSubTotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A05 项目级-全部-按产生部门类别-年度 */
export function doLoadProjectAllDepYear (parameter) {
  return axios({
    url: api.projectLevelAllDepYear,
    method: 'get',
    params: parameter
  })
}

/* A05 项目级-全部-按产生部门类别-年度   导出excel  */
export function exportProjectAllDepYear (parameter) {
  return axios({
    url: api.projectLevelAllDepYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A06 项目级-全部-按产生部门类别-月度 */
export function doLoadProjectAllDepMonth (parameter) {
  return axios({
    url: api.projectLevelAllDepMonth,
    method: 'get',
    params: parameter
  })
}

/* A06 项目级-全部-按产生部门类别-月度   导出excel  */
export function exportProjectAllDepMonth (parameter) {
  return axios({
    url: api.projectLevelAllDepMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A07 合同级-全部-小计 */
export function doLoadContractAllSubTotal (parameter) {
  return axios({
    url: api.contractLevelAllSubTotal,
    method: 'get',
    params: parameter
  })
}

/* A07 合同级-全部-小计   导出excel  */
export function exportContractAllSubTotal (parameter) {
  return axios({
    url: api.contractLevelAllSubTotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A08 合同级-全部-年度 */
export function doLoadContractAllSubTotalYear (parameter) {
  return axios({
    url: api.contractLevelAllYear,
    method: 'get',
    params: parameter
  })
}

/* A08 合同级-全部-年度   导出excel  */
export function exportContractAllSubTotalYear (parameter) {
  return axios({
    url: api.contractLevelAllYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A09 合同级-全部-月度 */
export function doLoadContractAllSubTotalMonth (parameter) {
  return axios({
    url: api.contractLevelAllMonth,
    method: 'get',
    params: parameter
  })
}

/* A09 合同级-全部-月度   导出excel  */
export function exportContractAllSubTotalMonth (parameter) {
  return axios({
    url: api.contractLevelAllMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A10 合同级-全部-按产生部门类别-小计 */
export function doLoadContractAllDepSubTotal (parameter) {
  return axios({
    url: api.contractLevelAllDepSubTotal,
    method: 'get',
    params: parameter
  })
}

/* A10 合同级-全部-按产生部门类别-小计   导出excel  */
export function exportContractAllDepSubTotal (parameter) {
  return axios({
    url: api.contractLevelAllDepSubTotalExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A11 合同级-全部-按产生部门类别-年度 */
export function doLoadContractAllDepYear (parameter) {
  return axios({
    url: api.contractLevelAllDepYear,
    method: 'get',
    params: parameter
  })
}

/* A11 合同级-全部-按产生部门类别-年度   导出excel  */
export function exportContractAllDepYear (parameter) {
  return axios({
    url: api.contractLevelAllDepYearExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

/* A12 合同级-全部-按产生部门类别-月度 */
export function doLoadContractAllDepMonth (parameter) {
  return axios({
    url: api.contractLevelAllDepMonth,
    method: 'get',
    params: parameter
  })
}

/* A12 合同级-全部-按产生部门类别-月度   导出excel  */
export function exportContractAllDepMonth (parameter) {
  return axios({
    url: api.contractLevelAllDepMonthExport,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
