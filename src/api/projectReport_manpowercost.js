import { axios } from '@/utils/request'

const api = {
  /* 人力成本-工作量 */
  projectLevelworkloadAll: '/manpowerreport/projectworkload/all',
  projectLevelworkloadExportAll: '/manpowerreport/projectworkload/alldownload',
  projectLevelworkloadAllByYear: '/manpowerreport/projectworkload/allbyyear',
  exportProjectLevelworkloadAllByYear: '/manpowerreport/projectworkload/allbyyeardownload',
  projectLevelworkloadAllByMonth: '/manpowerreport/projectworkload/allbymonth',
  exportProjectLevelworkloadAllByMonth: '/manpowerreport/projectworkload/allbymonthdownload',
  projectLevelworkloadAllByDep: '/manpowerreport/projectworkload/allbydep',
  exportProjectLevelworkloadAllByDep: '/manpowerreport/projectworkload/allbydepdownload',
  projectLevelworkloadAllByDepByYear: '/manpowerreport/projectworkload/allbydepbyyear',
  exportProjectLevelworkloadAllByDepByYear: '/manpowerreport/projectworkload/allbydepbyyeardownload',
  exportProjectLevelworkloadAllByDepByMonth: '/manpowerreport/projectworkload/allbydepbymonthdownload',

  contractLevelworkloadAll: '/manpowerreport/contractworkload/all',
  exportContractLevelworkloadAll: '/manpowerreport/contractworkload/alldownload',
  contractLevelworkloadAllByYear: '/manpowerreport/contractworkload/allbyyear',
  exportContractLevelworkloadAllByYear: '/manpowerreport/contractworkload/allbyyeardownload',
  contractLevelworkloadAllByMonth: '/manpowerreport/contractworkload/allbymonth',
  exportContractLevelworkloadAllByMonth: '/manpowerreport/contractworkload/allbymonthdownload',
  contractLevelworkloadAllByDep: '/manpowerreport/contractworkload/allbydep',
  exportContractLevelworkloadAllByDep: '/manpowerreport/contractworkload/allbydepdownload',
  contractLevelworkloadAllByDepByYear: '/manpowerreport/contractworkload/allbydepbyyear',
  exportContractLevelworkloadAllByDepByYear: '/manpowerreport/contractworkload/allbydepbyyeardownload',
  contractLevelworkloadAllByDepByMonth: '/manpowerreport/contractworkload/allbydepbymonth',
  exportContractLevelworkloadAllByDepByMonth: '/manpowerreport/contractworkload/allbydepbymonthdownload',
  /* 人力成本-金额 */
  pmoneyAll: '/manpowerreport/pmoney/all',
  exportPmoneyAll: '/manpowerreport/pmoney/alldownload',
  pmoneyAllByYear: '/manpowerreport/pmoney/allbyyear',
  exportPmoneyAllByYear: '/manpowerreport/pmoney/allbyyeardownload',
  pmoneyAllByMonth: '/manpowerreport/pmoney/allbymonth',
  exportPmoneyAllByMonth: '/manpowerreport/pmoney/allbymonthdownload',
  pmoneyAllByDep: '/manpowerreport/pmoney/allbydep',
  exportPmoneyAllByDep: '/manpowerreport/pmoney/allbydepdownload',
  pmoneyAllByDepByYear: '/manpowerreport/pmoney/allbydepbyyear',
  exportPmoneyAllByDepByYear: '/manpowerreport/pmoney/allbydepbyyeardownload',
  pmoneyAllByDepByMonth: '/manpowerreport/pmoney/allbydepbymonth',
  exportPmoneyAllByDepByMonth: '/manpowerreport/pmoney/allbydepbymonthdownload',

  cmoneyAll: '/manpowerreport/cmoney/all',
  exportCmoneyAll: '/manpowerreport/cmoney/alldownload',
  cmoneyAllByYear: '/manpowerreport/cmoney/allbyyear',
  exportCmoneyAllByYear: '/manpowerreport/cmoney/allbyyeardownload',
  cmoneyAllByMonth: '/manpowerreport/cmoney/allbymonth',
  exportCmoneyAllByMonth: '/manpowerreport/cmoney/allbymonthdownload',
  cmoneyAllByDep: '/manpowerreport/cmoney/allbydep',
  exportCmoneyAllByDep: '/manpowerreport/cmoney/allbydepdownload',
  cmoneyAllByDepByYear: '/manpowerreport/cmoney/allbydepbyyear',
  exportCmoneyAllByDepByYear: '/manpowerreport/cmoney/allbydepbyyeardownload',
  cmoneyAllByDepByMonth: '/manpowerreport/cmoney/allbydepbymonth',
  exportCmoneyAllByDepByMonth: '/manpowerreport/cmoney/allbydepbymonthdownload'
}

export function getProjectLevelworkloadAll (parameter) {
  return axios({
    url: api.projectLevelworkloadAll,
    method: 'get',
    params: parameter
  })
}

export function exportProjectLevelworkloadAll (parameter) {
  return axios({
    url: api.projectLevelworkloadExportAll,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getProjectLevelworkloadAllByYear (parameter) {
  return axios({
    url: api.projectLevelworkloadAllByYear,
    method: 'get',
    params: parameter
  })
}

export function exportProjectLevelworkloadAllByYear (parameter) {
  return axios({
    url: api.exportProjectLevelworkloadAllByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getProjectLevelworkloadAllByMonth (parameter) {
  return axios({
    url: api.projectLevelworkloadAllByMonth,
    method: 'get',
    params: parameter
  })
}

export function exportProjectLevelworkloadAllByMonth (parameter) {
  return axios({
    url: api.exportProjectLevelworkloadAllByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getProjectLevelworkloadAllByDep (parameter) {
  return axios({
    url: api.projectLevelworkloadAllByDep,
    method: 'get',
    params: parameter
  })
}

export function exportProjectLevelworkloadAllByDep (parameter) {
  return axios({
    url: api.exportProjectLevelworkloadAllByDep,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getProjectLevelworkloadAllByDepByYear (parameter) {
  return axios({
    url: api.projectLevelworkloadAllByDepByYear,
    method: 'get',
    params: parameter
  })
}

export function exportProjectLevelworkloadAllByDepByYear (parameter) {
  return axios({
    url: api.exportProjectLevelworkloadAllByDepByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getProjectLevelworkloadAllByDepByMonth (parameter) {
  return axios({
    url: api.projectLevelworkloadAllByDepByMonth,
    method: 'get',
    params: parameter
  })
}

export function exportProjectLevelworkloadAllByDepByMonth (parameter) {
  return axios({
    url: api.exportProjectLevelworkloadAllByDepByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//

export function getContractLevelworkloadAll (parameter) {
  return axios({
    url: api.contractLevelworkloadAll,
    method: 'get',
    params: parameter
  })
}

export function exportContractLevelworkloadAll (parameter) {
  return axios({
    url: api.exportContractLevelworkloadAll,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getContractLevelworkloadAllByYear (parameter) {
  return axios({
    url: api.contractLevelworkloadAllByYear,
    method: 'get',
    params: parameter
  })
}

export function exportContractLevelworkloadAllByYear (parameter) {
  return axios({
    url: api.exportContractLevelworkloadAllByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getContractLevelworkloadAllByMonth (parameter) {
  return axios({
    url: api.contractLevelworkloadAllByMonth,
    method: 'get',
    params: parameter
  })
}
export function exportContractLevelworkloadAllByMonth (parameter) {
  return axios({
    url: api.exportContractLevelworkloadAllByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getContractLevelworkloadAllByDep (parameter) {
  return axios({
    url: api.contractLevelworkloadAllByDep,
    method: 'get',
    params: parameter
  })
}
export function exportContractLevelworkloadAllByDep (parameter) {
  return axios({
    url: api.exportContractLevelworkloadAllByDep,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getContractLevelworkloadAllByDeppByYear (parameter) {
  return axios({
    url: api.contractLevelworkloadAllByDepByYear,
    method: 'get',
    params: parameter
  })
}
export function exportContractLevelworkloadAllByDeppByYear (parameter) {
  return axios({
    url: api.exportContractLevelworkloadAllByDepByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
//
export function getContractLevelworkloadAllByDeppByMonth (parameter) {
  return axios({
    url: api.contractLevelworkloadAllByDepByMonth,
    method: 'get',
    params: parameter
  })
}
export function exportContractLevelworkloadAllByDeppByMonth (parameter) {
  return axios({
    url: api.exportContractLevelworkloadAllByDepByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C01
export function getPmoneyAll (parameter) {
  return axios({
    url: api.pmoneyAll,
    method: 'get',
    params: parameter
  })
}

export function exportPmoneyAll (parameter) {
  return axios({
    url: api.exportPmoneyAll,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C02
export function getPmoneyAllByYear (parameter) {
  return axios({
    url: api.pmoneyAllByYear,
    method: 'get',
    params: parameter
  })
}

export function exportPmoneyAllByYear (parameter) {
  return axios({
    url: api.exportPmoneyAllByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C03
export function getPmoneyAllByMonth (parameter) {
  return axios({
    url: api.pmoneyAllByMonth,
    method: 'get',
    params: parameter
  })
}

export function exportPmoneyAllByMonth (parameter) {
  return axios({
    url: api.exportPmoneyAllByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C04
export function getPmoneyAllByDep (parameter) {
  return axios({
    url: api.pmoneyAllByDep,
    method: 'get',
    params: parameter
  })
}

export function exportPmoneyAllByDep (parameter) {
  return axios({
    url: api.exportPmoneyAllByDep,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C05
export function getPmoneyAllByDepByYear (parameter) {
  return axios({
    url: api.pmoneyAllByDepByYear,
    method: 'get',
    params: parameter
  })
}

export function exportPmoneyAllByDepByYear (parameter) {
  return axios({
    url: api.exportPmoneyAllByDepByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C06
export function getPmoneyAllByDepByMonth (parameter) {
  return axios({
    url: api.pmoneyAllByDepByMonth,
    method: 'get',
    params: parameter
  })
}

export function exportPmoneyAllByDepByMonth (parameter) {
  return axios({
    url: api.exportPmoneyAllByDepByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C07
export function getCmoneyAll (parameter) {
  return axios({
    url: api.cmoneyAll,
    method: 'get',
    params: parameter
  })
}

export function exportCmoneyAll (parameter) {
  return axios({
    url: api.exportCmoneyAll,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C08
export function getCmoneyAllByYear (parameter) {
  return axios({
    url: api.cmoneyAllByYear,
    method: 'get',
    params: parameter
  })
}

export function exportCmoneyAllByYear (parameter) {
  return axios({
    url: api.exportCmoneyAllByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C09
export function getCmoneyAllByMonth (parameter) {
  return axios({
    url: api.cmoneyAllByMonth,
    method: 'get',
    params: parameter
  })
}

export function exportCmoneyAllByMonth (parameter) {
  return axios({
    url: api.exportCmoneyAllByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C10
export function getCmoneyAllByDep (parameter) {
  return axios({
    url: api.cmoneyAllByDep,
    method: 'get',
    params: parameter
  })
}

// C11
export function getCmoneyAllByDepByYear (parameter) {
  return axios({
    url: api.cmoneyAllByDepByYear,
    method: 'get',
    params: parameter
  })
}

export function exportCmoneyAllByDepByYear (parameter) {
  return axios({
    url: api.exportCmoneyAllByDepByYear,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

// C12
export function getCmoneyAllByDepByMonth (parameter) {
  return axios({
    url: api.cmoneyAllByDepByMonth,
    method: 'get',
    params: parameter
  })
}

export function exportCmoneyAllByDepByMonth (parameter) {
  return axios({
    url: api.exportCmoneyAllByDepByMonth,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}

export function exportCmoneyAllByDep (parameter) {
  return axios({
    url: api.exportCmoneyAllByDep,
    method: 'get',
    params: parameter,
    responseType: 'arraybuffer'
  })
}
