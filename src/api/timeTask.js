import { axios } from '@/utils/request'

/**
 * 定时任务动态配置
 * @type {{deleteMenu: string, updateMenu: string, getMenuList: string, getMenuInfo: string}}
 */
const api = {
  getTaskList: '/timetask/tasklist',
  saveTask: '/timetask/savetask',
  removeTask: '/timetask/removetask',
  changeStatus: '/timetask/changestatus',
  getTimeTaskInfo:'/timetask/gettimetask',
  saveTaskGroup:'/timetask/savetaskgroup',
  removeTaskGroup:'/timetask/removetaskgroup',
  getTimeTaskGroupTree:'/timetask/gettaskgrouptree',
}

/**
 * 获取所有定时任务列表
 * @returns {AxiosPromise}
 */
export function getTaskList (parameter) {
  return axios({
    url: api.getTaskList,
    method: 'post',
    data: parameter
  })
}

/**
 * 保存修改定时任务
 * @param parameter
 * @returns {AxiosPromise}
 */
export function saveTask (parameter) {
  return axios({
    url: api.saveTask,
    method: 'post',
    data: parameter
  })
}

/**
 * 删除定时任务
 * @param parameter
 * @returns {AxiosPromise}
 */
export function removeTask (parameter) {
  return axios({
    url: api.removeTask,
    method: 'post',
    data: parameter
  })
}

/**
 * 禁用菜单
 * @param parameter
 * @returns {AxiosPromise}
 */
export function changeStatus (parameter) {
  return axios({
    url: api.changeStatus,
    method: 'get',
    params: parameter
  })
}

/**
 * 根据id获取定时任务信息
 * @param parameter
 * @returns {AxiosPromise}
 */
export function getTimeTaskInfo (parameter) {
  return axios({
    url: api.getTimeTaskInfo,
    method: 'get',
    params: parameter
  })
}


/**
 * 获取任务分组树 数据
 * @param parameter
 * @returns {AxiosPromise}
 */
export function getTimeTaskGroupTree (parameter) {
  return axios({
    url: api.getTimeTaskGroupTree,
    method: 'get',
    params: parameter
  })
}

/**
 * 删除任务分组
 * @param parameter
 * @returns {AxiosPromise}
 */
export function removeTaskGroup (parameter) {
  return axios({
    url: api.removeTaskGroup,
    method: 'get',
    params: parameter
  })
}

/**
 * 保存修改定时任务分组
 * @param parameter
 * @returns {AxiosPromise}
 */
export function saveTaskGroup (parameter) {
  return axios({
    url: api.saveTaskGroup,
    method: 'post',
    data: parameter
  })
}