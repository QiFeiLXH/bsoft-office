// eslint-disable-next-line
import * as loginService from '@/api/login'
// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView } from '@/layouts'

// 前端路由表
const constantRouterComponents = {
  // 基础页面 layout 必须引入
  BasicLayout: BasicLayout,
  BlankLayout: BlankLayout,
  RouteView: RouteView,
  PageView: PageView,
  'Exception403': () => import(/* webpackChunkName: "error" */ '@/views/exception/403'),
  'Exception404': () => import(/* webpackChunkName: "error" */ '@/views/exception/404'),
  'Exception500': () => import(/* webpackChunkName: "error" */ '@/views/exception/500'),

  // 你需要动态引入的页面组件
  // account
  'WorklogList': () => import('@/views/project/worklog/WorklogList'),
  'WorklogEditList': () => import('@/views/project/worklog/WorklogEditList'),
  'LogChartView': () => import('@/views/project/worklog/LogChartView'),
  // system
  'Menu': () => import('@/views/system/menu/Menu'),
  'ProjectLog': () => import('@/views/project/worklog/ProjectWorklog'),
  'ProjectPlanList': () => import('@/views/project/plan/ProjectPlanList'),
  'ProjectLogQueryList': () => import('@/views/project/worklog/ProjectLogQueryList'),

  // 项目组
  // 'MembersManage': () => import('@/views/project/group/MembersManage'),
  'GroupMembersMaintain': () => import('@/views/project/group/GroupMembersMaintain'),
  'ProjectPlanQueryList': () => import('@/views/project/plan/ProjectPlanQueryList'),
  'RoleManager': () => import('@/views/system/role/RoleManager'),
  // 工程报表
  'ReportAll': () => import('@/views/project/report/ReportAll'),
  'ManpowerCost': () => import('@/views/project/report/ManpowerCost'),
  'Expenses': () => import('@/views/project/report/Expenses'),
  'ProjectBonus': () => import('@/views/project/report/ProjectBonus'),
  // 系统日志报表
  'UsageLog': () => import('@/views/system/log/usageLog/UsageLog'),
  // 定时器配置
  'TimeTask': () => import('@/views/system/timeTask/TimeTaskList'),
  // 责任书
  'DutyLetterMaintain': () => import('@/views/project/duty/DutyLetterMaintain'),
  'DutyLetterAudit': () => import('@/views/project/duty/DutyLetterAudit'),

  // 区域进度
  'RegionManager': () => import('@/views/project/progress/RegionManager'),
  'DeptManager': () => import('@/views/project/progress/DeptManager'),
  'ProjectManager': () => import('@/views/project/progress/ProjectManager'),
  // 项目模块节点维护
  'ReportTypeManager': () => import('@/views/project/progress/reportType/ReportTypeManager'),
  // 项目上报类型维护
  'ProjectProductViewManager': () => import('@/views/project/progress/reportType/ProjectProductView'),
  // 项目上报类型维护
  'ProjectReportCountView': () => import('@/views/project/progress/reportType/ProjectReportCountView'),

  // 进度上报
  'ProgressReportView': () => import('@/views/project/progress/report/ProgressReportListView'),
  // 项目文档上传统计
  'ProjectWordCountView': () => import('@/views/project/progress/view/ProjectWordCountView'),

  // 进度上报查询统计
  'ProjectProgressCountView': () => import('@/views/project/progress/view/ProjectProgressCountView')
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*', redirect: '/404', hidden: true
}

// 根级菜单
const rootRouter = {
  key: '',
  name: 'index',
  path: '',
  component: 'BasicLayout',
  redirect: '/project/auditLog',
  meta: {
    title: '首页'
  },
  children: []
}

/**
 * 动态生成菜单
 * @param token
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = ({ commit }) => {
  return new Promise((resolve, reject) => {
    const params = { 'system': 13 }
    loginService.getCurrentUserNav(params).then(res => {
      const result = res.body
      const permissions = []
      const permissionList = []
      if (result && result.length > 0) {
        result.map(menu => {
          if (menu.auth != null && menu.auth.length > 0) {
            permissionList.push(menu.id.toString())
            const actionList = []
            menu.auth.map(perAuth => {
              actionList.push(perAuth.key.toString())
            })
            const per = {
              'permissionId': menu.id.toString(),
              'actionList': actionList
            }
            permissions.push(per)
          }
        })
      }
      const role = {
        'permissionList': permissionList,
        'permissions': permissions
      }
      commit('SET_ROLES', role)
      const menuNav = []
      const childrenNav = []
      // 后端数据, 根级树数组,  根级 PID
      listToTree(result, childrenNav, 0, null)
      rootRouter.children = childrenNav
      menuNav.push(rootRouter)
      const routers = generator(menuNav)
      routers.push(notFoundRouter)
      resolve(routers)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 *
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generator = (routerMap, parent) => {
  return routerMap.map(item => {
    const { name, show, hideChildren, hiddenHeaderContent, target, icon, id, help } = item || {}
    const currentRouter = {
      // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
      path: item.object || `${parent && parent.object || ''}/${item.key}`,
      // 路由名称，建议唯一
      name: item.id || item.key || '',
      // 该路由对应页面的
      component: constantRouterComponents[item.component || item.key],
      // 该路由对应页面的 组件 :方案2 (动态加载)
      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: name,
        icon: icon || undefined,
        hiddenHeaderContent: hiddenHeaderContent,
        target: target,
        permission: id + '',
        id: id,
        help: help
      }
    }
    // 是否设置了隐藏菜单
    if (show === false) {
      currentRouter.hidden = true
    }
    // 是否设置了隐藏子菜单
    if (hideChildren) {
      currentRouter.hideChildrenInMenu = true
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // Recursion
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
const listToTree = (list, tree, parentId, parentHelp) => {
  list.forEach(item => {
    // 判断是否为父级菜单
    if (item.parentId === parentId) {
	  if (item.help == null && parentHelp != null) {
        item.help = parentHelp
      }
      const child = {
        ...item,
        key: item.key || item.name,
        children: []
      }
      // 迭代 list， 找到当前菜单相符合的所有子菜单
      listToTree(list, child.children, item.id, item.help)
      // 删掉不存在 children 值的属性
      if (child.children.length <= 0) {
        delete child.children
      }
      // 加入到树中
      tree.push(child)
    }
  })
}
