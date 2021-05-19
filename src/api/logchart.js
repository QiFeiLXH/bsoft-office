import { axios} from "@/utils/request";

const api = {
  logChartDayList: "logchart/query/day",
  logChartMonthList: "logchart/query/month"
}

/* 培训情况查询（按月） */
export function getLogChartList (parameter) {
  return axios({
    url: api.logChartDayList,
    method: 'GET',
    params: parameter
  })
}
/* 培训情况查询（按年）*/
export function getLogChartMonthList (parameter) {
  return axios({
    url: api.logChartMonthList,
    method: 'GET',
    params: parameter,
  })
}