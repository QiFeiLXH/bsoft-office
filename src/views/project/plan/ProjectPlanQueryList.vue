<template>
  <a-card :bordered="false" :bodyStyle="{height:cardHeight+'px',padding: '24px 10px'}">

    <div>
      <a-row style="margin-bottom: 20px">
        <a-col :span="7">
          <span style="margin-right:20px">签定日期:</span>
          <a-range-picker
            :allowClear="false"
            :format="dateFormat"
            v-model="signDate"
            @change="onDateChange"
            :style="{ marginLeft: '10',width: '70%' }"/>
        </a-col>
        <a-col :span="8">
          <a-input-search
            :pressEnter="doQuery"
            :allowClear="true"
            v-model="queryParam.inputContent"
            placeholder="项目名称"
            style="width: 80%;margin-left:50px"
            @search="doQuery" />
        </a-col>
        <a-col :span="9" style="margin-top: 5px">
          <a-radio-group v-model="queryParam.optionsValue" @change="onChange">
            <a-radio value="-1">全部</a-radio>
            <a-radio value="1">已创建</a-radio>
            <a-radio value="0">未创建</a-radio>
          </a-radio-group>
          <span>
            <a @click="toggleAdvanced">
              {{ advanced ? '收起' : '展开' }}
              <a-icon :type="advanced ? 'up' : 'down'"/>
            </a>
          </span>
        </a-col>
      </a-row>
      <a-row style="margin-bottom: 20px" v-if="advanced">
        <a-col :span="7">
          <span style="margin-right:20px">项目经理:</span>
          <a-input v-model="queryParam.projectManager" @pressEnter="doQuery" style="width: 70%" :allowClear="true"/>
        </a-col>
        <a-col :span="8">
          <span style="margin-right:20px">大区:</span>
          <a-input v-model="queryParam.largeArea" @pressEnter="doQuery" style="width: 80%" :allowClear="true"/>
        </a-col>
        <a-col :span="9">
          <span style="margin-right:20px">工程区域:</span>
          <a-input v-model="queryParam.area" @pressEnter="doQuery" style="width: 70%" :allowClear="true"/>
        </a-col>
    </a-row>
    </div>
    <a-table
      v-watermark
      :loading="isLoading"
      size="small"
      :dataSource="projectPlanQueryList"
      :rowKey="(record) => record.contractNo"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :pagination="false"
      :columns="columns"
      :scroll="{ x: false, y: listScrollHeight }">
      <template slot="serial" slot-scope="text, record, index">
        <span>
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </span>
      </template>
      <span slot="status" slot-scope="text">
        <a-badge :status="text | statusTypeFilter" :text="text | statusFilter"/>
      </span>
      <template slot="totalWorkload" slot-scope="text, record">
        <span v-if="text">
          <span>{{(record.workloadAudited?record.workloadAudited:'0.00') + ' / ' + text}}</span>
        </span>
      </template>
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="doLookPlan(record)">查看</a>
        </template>
      </span>
    </a-table>
    <footer-tool-bar>
      <a-pagination
        :total="pagination.total"
        :pageSize.sync="pagination.pageSize"
        v-model="pagination.current"
        @change="handleCurrentPageChange"
        @showSizeChange="onShowSizeChange"
        :showTotal="total => `共 ${total} 条`"
        style="margin-top: 10px"/>
    </footer-tool-bar>
    <a-drawer
      :wrapStyle="{overflow: 'hidden'}"
      ref="workLogModal"
      :title="modalTitle"
      placement="right"
      :closable="false"
      width="1200"
      @close="onClose"
      :visible="visible"
      :bodyStyle="{ padding: '10px 0 0 0',background: 'transparent' }">
      <a-row>
        <a-col :span="11">
          <div class="treeStyle" :style="{height: treeHeight}">
            <s-tree
              ref="tree"
              :dataSource="planTree"
              :openKeys.sync="openKeys"
              :search="false"
              :showTitle="true"
              :showTime="false"
              :showLognum="false"
              :noPlan="noPlan"
              :time="time"
              :selectKey="selectKey"
              :totalWorkloadRate="totalWorkloadRate"
              @parentClick="parentClick"
              @click="handleClick"
            />
          </div>
        </a-col>
        <a-col :span="13" style="margin-bottom: 50px;background: #f0f2f5">
          <div :style="{height:rightPanelHeight, overflow: 'hidden auto', width: '636px', background:'white' }" class="rightPanelClass">
            <div style="background:#f0f2f5; padding:0 0px 10px 0">
              <a-card :bordered="false">
                <a-table
                  size="small"
                  :bordered="false"
                  :loading="isWorklogLoading"
                  :dataSource="worklogList"
                  :rowKey="(record) => record.id "
                  :customRow="onWorklogClickRow"
                  :rowClassName="setWorklogCurrentRow"
                  @change="handleWorklogCurrentPageChange"
                  :columns="worklogColumns"
                  :pagination="worklogPagination"
                  :scroll="{ x: false, y: worklogListScrollHeight }"
                  :style="{background: 'white', height: worklogTableHeight}">
                  <span slot="result" slot-scope="text">
                    {{ text | resultFilter }}
                  </span>
                  <template slot="auditStatus" slot-scope="text, record">
                    <span v-if="record.auditStatus === 4" style="color: #5daf34;">{{ record.auditStatusText }}</span>
                    <span v-else style="color: #0c00ca;">{{ record.auditStatusText }}</span>
                  </template>
                </a-table>
              </a-card>
            </div>
            <div style="background:#f0f2f5; padding:10px 0px 0px 0">
              <a-card :bordered="false" :body-style="{padding:'0 0 10px 10px'}">
                <a-form>
                  <a-form-item
                    label="范围"
                    :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                    :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                    :required="false"
                    style="margin-bottom: 0px;"
                  >
                    <a-radio-group v-model="workLog.range">
                      <a-radio :disabled="workLog.range != 1" :value="1">合同内</a-radio>
                      <a-radio :disabled="workLog.range != 2" :value="2">合同外</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item
                    label="计划"
                    :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                    :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                    :required="false"
                    style="margin-bottom: 0px;"
                  >
                    <a-radio-group v-model="workLog.plan">
                      <a-radio :disabled="workLog.plan != 1" :value="1">计划内</a-radio>
                      <span v-if="planName !== ''">
                        <a-tag color="#87d068" v-if="showTipTag && planName.length < 20">{{ planName }}</a-tag>
                        <a-tooltip placement="top" v-else-if="showTipTag">
                          <template slot="title">
                            <span>{{ planName }}</span>
                          </template>
                          <a-tag color="#87d068">{{ planName.substring(0,20)+'...'}}</a-tag>
                        </a-tooltip>
                      </span>
                      <a-radio :disabled="workLog.plan != 2" :value="2" style="position:absolute;left:360px;bottom:-1px">计划外</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item
                    label="角色"
                    :labelCol="{lg: {span: 2}, sm:{span: 2}}"
                    :wrapperCol="{lg: {span: 22}, sm:{span: 20}}"
                    :required="false"
                    style="margin-bottom: 0px;"
                  >
                    <a-radio-group v-model="workLog.role">
                      <a-radio-button :disabled="workLog.role !== item.id" :value="item.id" v-for="item in roles" :key="item.id">{{item.name}}</a-radio-button>
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item
                    label="方式"
                    :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                    :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                    :required="false"
                    style="margin-bottom: 0px;"
                  >
                    <a-radio-group v-model="workLog.model">
                      <a-radio :disabled="workLog.model != 1" :value="1" style="margin-right:23px">现场</a-radio>
                      <a-radio :disabled="workLog.model != 2" :value="2">远程</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item
                    label="类别"
                    :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                    :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                    :required="false"
                    style="margin-bottom: 0px;"
                  >
                    <a-radio-group v-model="workLog.type">
                      <a-radio-button :disabled="workLog.type !== item.id" :value="item.id" v-for="(item) in types" :key="item.id">{{item.name}}</a-radio-button>
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item
                    label="内容"
                    :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                    :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                    style="margin-bottom: 0px;">
                    <a-textarea
                      style="width:533px"
                      :readonly="true"
                      rows="4"
                      v-model="workLog.workLog"
                      v-decorator="[
                        'workLog',
                        {rules: [{required: true, message: '请输入事件' }]}
                      ]" />
                  </a-form-item>
                  <a-row>
                    <a-col span="12">
                      <a-form-item
                        label="工时"
                        :labelCol="{lg: {span: 4}, sm: {span: 4}}"
                        :wrapperCol="{lg: {span: 10}, sm: {span: 20} }"
                        :required="false"
                        style="margin-bottom: 0px;"
                      >
                        <a-input :readonly="true" v-model="workLog.workload" style="width:80%"/>  h
                      </a-form-item>
                    </a-col>
                    <a-col span="12">
                      <a-form-item
                        label="事件结果"
                        :labelCol="{lg: {span: 6}, sm: {span: 6}}"
                        :wrapperCol="{lg: {span: 18}, sm: {span: 18} }"
                        :required="false"
                        style="margin-bottom: 0px;margin-left: -15px"
                      >
                        <a-radio-group v-model="workLog.result">
                          <a-radio :disabled="workLog.result != 0" :value="0">进行中</a-radio>
                          <a-radio :disabled="workLog.result != 1" :value="1">已完成</a-radio>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </a-card>
            </div>
          </div>
        </a-col>
      </a-row>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '49%',
          borderTop: '1px solid #e9e9e9',
          padding: '9px 16px',
          background: '#fff',
          textAlign: 'right',
        }"
      >
        <a-button key="back" @click="onClose">关闭</a-button>
      </div>
    </a-drawer>
  </a-card>
</template>

<script>
import '@/assets/style/style.less'
import STree from '@/components/PlanTree/Tree'
import WorkLogInfo from '@/module/project/worklog/WorkLogInfo'
import FooterToolBar from '@/components/FooterToolbar'
import { doLoadProjectPlanQueryList, doLoadProjectPlanQueryTree, doLoadProjectWorklogList, doLoadWorklogInfo, initpage } from '@/api/projectPlanQuery'
import moment from 'moment'

const statusMap = {
  0: {
    status: 'default',
    text: '未创建'
  },
  1: {
    status: 'success',
    text: '已创建'
  }
}

const worklogColumns = [
  {
    title: '日期',
    dataIndex: 'attendanceDate',
    width: '23%'
  },
  {
    title: '姓名',
    dataIndex: 'personName',
    width: '23%'
  },
  {
    title: '工时（h）',
    dataIndex: 'workload',
    width: '18%'
  },
  {
    title: '比例',
    dataIndex: 'workloadRate',
    width: '18%'
  },
  {
    title: '状态',
    dataIndex: 'auditStatus',
    scopedSlots: { customRender: 'auditStatus' },
    width: '18%'
  }
]

const resultMap = {
  0: {
    text: '进行中'
  },
  1: {
    text: '已完成'
  }
}

export default {
  name: 'ProjectPlanQueryList',
  components: {
    FooterToolBar,
    STree,
    WorkLogInfo
  },
  data () {
    return {
      visible: false,
      isLoading: false,
      projectPlanQueryList: [],
      editGroupShow: false,
      tableHeight: 0,
      listScrollHeight: 0,
      cardHeight: 0,
      worklogTableHeight: 0,
      worklogListScrollHeight: 0,
      roles: [],
      types: [],
      pagination: {
        total: 1,
        current: 1,
        pageSize: 25 // 每页中显示10条数据
      },
      // 表头
      columns: [
        {
          title: ' ',
          scopedSlots: { customRender: 'serial' },
          width: '4%'
        },
        {
          title: '合同编号',
          dataIndex: 'contractNo',
          width: '7%'
        },
        {
          title: '大区',
          dataIndex: 'largeAreaText',
          width: '9%'
        },
        {
          title: '工程区域',
          dataIndex: 'areaText',
          width: '10%'
        },
        {
          title: '项目名称',
          dataIndex: 'contractName',
          width: '29%'
        },
        {
          title: '项目类别',
          dataIndex: 'flagText',
          width: '7%'
        },
        {
          title: '项目经理',
          dataIndex: 'projectManagerText',
          width: '8%'
        },
        {
          title: '项目计划',
          dataIndex: 'planFlag',
          scopedSlots: { customRender: 'status' },
          width: '9%'
        },
        {
          title: '已审工作量 / 总工作量',
          dataIndex: 'totalWorkload',
          scopedSlots: { customRender: 'totalWorkload' },
          width: '12%'
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '5%',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 当前行
      selectedRow: '',
      selectedRowInfo: '',
      modalTitle: '',
      planTree: [],
      openKeys: [],
      selectKey: [],
      totalWorkloadRate: 0.0,
      time: [],
      isWorklogLoading: false,
      worklogList: [],
      worklogPage: {
        total: 1,
        current: 1,
        pageSize: 10
      },
      worklogPagination: {
        total: 0,
        size: 'small',
        current: 0,
        pageSize: 0, // 每页中显示10条数据
        showTotal: total => `共有 ${total} 条数据` // 分页中显示总的数据
      },
      workLog: {},
      planName: '',
      selectItem: { id: null, milepostName: '' },
      showTipTag: false,
      worklogColumns,
      milepostId: '',
      projectId: '',
      contractNo: '',
      noPlan: false,
      advanced: false,
      queryParam: {
        optionsValue: '1',
        inputContent: '',
        projectManager: '',
        largeArea: '',
        area: '',
        pageSize: 25,
        pageNo: 1,
        startDate: null,
        endDate: null
      },
      dateFormat: 'YYYY-MM-DD',
      moment,
      signDate: []
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    },
    resultFilter (val) {
      return resultMap[val].text
    }
  },
  created () {
    this.getWidthAndHeight()
    this.initRoleAndType()
    this.initParam()
  },
  methods: {
    initRoleAndType () {
      initpage()
        .then(res => {
          if (res.code === 200) {
            this.roles = res.body.roles
            this.types = res.body.types
          }
        })
    },
    // 树选中方法
    handleClick (e) {
      this.selectItem = e.item.value
      this.planName = this.selectItem.milepostName
      this.milepostId = e.key
      this.selectKey = [e.key]
      this.worklogPage.current = 1
      this.loadProjectWorkLogs()
      this.workLog = {}
      this.worklogSelectedRow = ''
      this.showTipTag = false
    },
    parentClick: function (item) {
      this.selectKey = [item.id]
      this.selectItem = item
      this.planName = this.selectItem.milepostName
      this.milepostId = item.id
      this.worklogPage.current = 1
      this.loadProjectWorkLogs()
      this.workLog = {}
      this.worklogSelectedRow = ''
      this.showTipTag = false
    },
    loadProjectPlanQueryList () {
      this.isLoading = true
      var param = {}
      doLoadProjectPlanQueryList(Object.assign(param, this.queryParam))
        .then(res => {
          if (res.code === 200) {
            this.pagination.total = res.body.totalCount
            this.pagination.pageSize = this.queryParam.pageSize
            this.pagination.current = this.queryParam.pageNo
            this.projectPlanQueryList = res.body.items
            this.selectedRow = ''
          }
          this.isLoading = false
        }).catch((res) => {
          console.log(res)
        })
    },
    handleCurrentPageChange (pageNo) {
      this.queryParam.pageNo = pageNo
      this.loadProjectPlanQueryList()
    },
    onShowSizeChange (current, pageSize) {
      this.queryParam.pageSize = pageSize
      this.queryParam.pageNo = 1
      this.loadProjectPlanQueryList()
    },
    getWidthAndHeight () {
      this.listScrollHeight = window.innerHeight - 295
      this.worklogListScrollHeight = (window.innerHeight - 135)
      this.worklogTableHeight = window.innerHeight - 555
      this.cardHeight = window.innerHeight - 165
      this.tableHeight = window.innerHeight - 200
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.contractNo
            this.selectedRowInfo = record
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.contractNo === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    onDateChange () {
      this.queryParam.pageNo = 1
      this.queryParam.startDate = this.signDate[0].format('YYYY-MM-DD')
      this.queryParam.endDate = this.signDate[1].format('YYYY-MM-DD')
      this.selectedRow = ''
      this.loadProjectPlanQueryList()
    },
    onChange (e) {
      this.queryParam.optionsValue = e.target.value
      this.pagination.current = 1
      this.loadProjectPlanQueryList()
    },
    doQuery () {
      this.loadProjectPlanQueryList()
    },
    onWorklogClickRow (record) {
      const me = this
      return {
        on: {
          click: () => {
            me.worklogSelectedRow = record.id
            this.loadWorklogInfo(record.id)
          }
        }
      }
    },
    handleWorklogCurrentPageChange (pagination) {
      this.worklogPage.current = pagination.current
      this.worklogPage.pageSize = pagination.pageSize
      this.loadProjectWorkLogs()
    },
    setWorklogCurrentRow (record) {
      let styleClassName = ''
      if (record.id === this.worklogSelectedRow) {
        styleClassName = 'clickRowStyle'
      }
      return styleClassName
    },
    loadWorklogInfo (val) {
      var params = { id: val }
      doLoadWorklogInfo(params).then(res => {
        if (res.code === 200) {
          if (res.body != null || res.body !== undefined) {
            this.workLog = res.body
            if (this.milepostId !== -1) {
              this.showTipTag = true
            }
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    loadProjectWorkLogs () {
      this.isWorklogLoading = true
      var pageSize = this.worklogPage.pageSize
      var pageNo = this.worklogPage.current
      var params = { milepostId: this.milepostId, contractNo: this.contractNo, pageSize: pageSize, pageNo: pageNo }
      doLoadProjectWorklogList(params).then(res => {
        if (res.code === 200) {
          if (res.body != null || res.body !== undefined) {
            this.worklogList = res.body.items
            this.worklogPagination.total = res.body.totalCount
            this.worklogPagination.pageSize = this.worklogPage.pageSize
            this.worklogPagination.current = this.worklogPage.current
          }
        } else {
          this.$message.error(res.msg)
        }
        this.isWorklogLoading = false
      })
    },
    doLookPlan (record) {
      this.projectId = record.projectId
      this.contractNo = record.contractNo
      this.modalTitle = record.contractName + '（' + record.projectManagerText + '）'
      this.loadProjectPlanQueryTree(record.contractNo, record.projectId)
      this.visible = true
    },
    loadProjectPlanQueryTree (contactNo, projectId) {
      const param = { 'contractNo': contactNo, 'projectId': projectId }
      doLoadProjectPlanQueryTree(param).then(res => {
        if (res.code === 200) {
          this.planTree = res.body.planTree
          this.openKeys = res.body.openKeys
          this.totalWorkloadRate = res.body.total
          this.noPlan = res.body.noPlan
          if (this.noPlan) {
            this.selectKey = [-1]
            this.planName = '计划外'
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    onClose () {
      this.visible = false
      this.resetModal()
    },
    resetModal () {
      this.totalWorkloadRate = 0.0
      this.workLog = {}
      this.worklogList = []
      this.planTree = []
      this.selectKey = []
      this.worklogSelectedRow = ''
      this.showTipTag = false
      this.milepostId = ''
      this.contractNo = ''
      this.projectId = ''
      this.worklogPagination = {
        total: 0,
        size: 'small',
        current: 0,
        pageSize: 0, // 每页中显示10条数据
        showTotal: total => `共有 ${total} 条数据` // 分页中显示总的数据
      }
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
      if (this.advanced) {
        this.listScrollHeight = window.innerHeight - 345
      } else {
        this.listScrollHeight = window.innerHeight - 285
      }
    },
    initParam () {
      var theFirstDayOfYear = moment().startOf('year') // 本年第一天
      var today = moment() // 今天
      this.signDate.push(theFirstDayOfYear, today)
      this.queryParam.startDate = theFirstDayOfYear.format('YYYY-MM-DD')
      this.queryParam.endDate = today.format('YYYY-MM-DD')
    }
  },
  mounted () {
    this.loadProjectPlanQueryList()
  },
  computed: {
    treeHeight: function () {
      return (window.innerHeight - 80) + 'px'
    },
    rightPanelHeight: function () {
      return (window.innerHeight - 117) + 'px'
    }
  }
}
</script>

<style lang="less" scoped>
  .treeStyle {
    background: white;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .rightPanelClass {
    overflow-x: hidden;
    overflow-y: auto;
  }

  /deep/ .ant-card-body {
    padding: 0 0 0 0;
  }

  /deep/ .ant-menu-inline, .ant-menu-vertical, .ant-menu-vertical-left {
    border-right: 0px solid #e8e8e8
  }
</style>
