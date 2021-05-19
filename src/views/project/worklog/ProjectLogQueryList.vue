<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '24px 10px'
    }">
    <a-row>
      <a-col :span="5">
        <s-table
          ref="projectTable"
          size="small"
          rowKey="projectId"
          :columns="projectColumns"
          :height="tableHeight"
          :data="displayProjectsWithLogsnum"
          :customRow="onProjectClickRow"
          :rowClassName="setProjectCurrentRow"
          :showSizeChanger="false"
          :pageSize="projectPagination.pageSize"
          :pageNum="projectPagination.pageNumber"
          :showPagination="projectPagination.totalPages > 1"
          :bodyStyle="{
            minHeight:projectListHeight+'px'
          }"
          :scroll="{ x: false, y: projectListHeight }"
        >
          <template slot="logsNum" slot-scope="text">
            <span style="color:blue;float:right">{{ text }}</span>
          </template>
        </s-table>
      </a-col>
      <a-col :span="19">
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="24">
              <a-col :md="8" :sm="24">
                <a-form-item>
                  <a-range-picker
                    :allowClear="false"
                    :style="{'margin-left':'10px','width': '100%'}"
                    :format="dateFormat"
                    v-model="attendanceDate"
                    @change="onRefresh"
                    :placeholder="['考勤开始日期', '考勤结束日期']"/>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item>
                  <a-input placeholder="请输入姓名或部门" v-model="logQueryParam.inputContent" style="width: 100%" @pressEnter="onLogRefresh"/>
                </a-form-item>
              </a-col>
              <a-col :md="2" :sm="24" style="padding: unset">
                <a-button type="primary" icon="search" @click="onLogRefresh"/>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <s-table
          ref="logTable"
          size="small"
          rowKey="id"
          :columns="projectLogColumns"
          :height="tableHeight"
          :data="loadProjectLogSummary"
          :customRow="onModalClickRow"
          :rowClassName="setModalCurrentRow"
          :showSizeChanger="false"
          :pageSize="projectLogPagination.pageSize"
          :pageNum="projectLogPagination.pageNumber"
          :showPagination="true"
          :bodyStyle="{
            minHeight:listScrollHeight+'px'
          }"
          :scroll="{ x: false, y: listScrollHeight }"
        >
          <template slot="rowIndex" slot-scope="text, record, index">
            <span>
              {{ (projectLogPagination.pageNumber - 1) * projectLogPagination.pageSize + index + 1 }}
            </span>
          </template>
          <span slot="worklog" slot-scope="text">
            <a-tooltip placement="left" v-if="text.length > 100">
              <template slot="title">
                {{ text }}
              </template>
              {{ text.length > 150 ? text.substring(0,150)+'...' : text }}
            </a-tooltip>
            <span v-if="text.length <= 100">{{ text }}</span>
          </span>

        </s-table>
        <a-drawer
          :title="'日志详细信息'+detailTile"
          placement="right"
          :closable="false"
          :width="720"
          @close="onClose"
          :visible="modalVisible"
          :bodyStyle="{ padding: '0px 0px 0px 0px' }"
        >
          <a-card :bordered="false" :body-style="{padding:'10px 0px 0px 40px'}">
            <a-collapse :bordered="false" @change="collapseChange">
              <a-collapse-panel :header="colTitle" key="1" :style="customStyle">
                <project-info :projectInfo="modalInfo" :userId="userId" widthStyle="100%"/>
              </a-collapse-panel>
            </a-collapse>
          </a-card>
          <a-card
            :bordered="false"
            :body-style="{padding:'0px 24px 0px 24px'}"
            :style="{height: formHeight+'px'}"
            :class="formHeight <= 432 ? 'form-style':''">
            <a-form>
              <a-form-item
                label="范围"
                :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                :required="false"
                style="margin-bottom: 10px;"
              >
                <a-radio-group v-model="modalInfo.range">
                  <a-radio :disabled="modalInfo.range != 1" :value="1">合同内</a-radio>
                  <a-radio :disabled="modalInfo.range != 2" :value="2">合同外</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="计划"
                :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                :required="false"
                style="margin-bottom: 10px;"
              >
                <a-radio-group v-model="modalInfo.plan">
                  <a-radio :disabled="modalInfo.plan != 1" :value="1">计划内</a-radio>
                  <span v-if="showTipTag">
                    <a-tag color="#87d068" v-if="milepostName.length < 20">{{ milepostName }}</a-tag>
                    <a-tooltip placement="top" v-else>
                      <template slot="title">
                        <span>{{ milepostName }}</span>
                      </template>
                      <a-tag color="#87d068">{{ milepostName.substring(0,20)+'...' }}</a-tag>
                    </a-tooltip>
                  </span>
                  <a-radio :disabled="modalInfo.plan != 2" :value="2" style="position:absolute;left:360px;bottom:-1px">计划外</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="角色"
                :labelCol="{lg: {span: 2}, sm:{span: 2}}"
                :wrapperCol="{lg: {span: 22}, sm:{span: 20}}"
                :required="false"
                style="margin-bottom: 10px;"
              >
                <a-radio-group v-model="modalInfo.role">
                  <a-radio-button :disabled="modalInfo.role !== item.id" :value="item.id" v-for="(item, index) in roles" :key="index">{{ item.name }}</a-radio-button>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="方式"
                :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                :required="false"
                style="margin-bottom: 10px;"
              >
                <a-radio-group v-model="modalInfo.model">
                  <a-radio :disabled="modalInfo.model != 1" :value="1" style="margin-right:23px">现场</a-radio>
                  <a-radio :disabled="modalInfo.model != 2" :value="2">远程</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="类别"
                :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                :required="false"
                style="margin-bottom: 10px;"
              >
                <a-radio-group v-model="modalInfo.type">
                  <a-radio-button :disabled="modalInfo.type !== item.id" :value="item.id" v-for="(item, index) in types" :key="index">{{ item.name }}</a-radio-button>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="内容"
                :labelCol="{lg: {span: 2}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
                style="margin-bottom: 10px;">
                <a-textarea
                  style="width:533px"
                  :readonly="true"
                  rows="4"
                  v-model="modalInfo.worklog"
                  v-decorator="[
                    'worklog',
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
                    style="margin-bottom: 10px;"
                  >
                    <a-input :readonly="true" v-model="modalInfo.workload" style="width:80%"/>  h
                  </a-form-item>
                </a-col>
                <a-col span="12">
                  <a-form-item
                    label="事件结果"
                    :labelCol="{lg: {span: 6}, sm: {span: 6}}"
                    :wrapperCol="{lg: {span: 18}, sm: {span: 18} }"
                    :required="false"
                    style="margin-bottom: 10px;margin-left: -15px"
                  >
                    <a-radio-group v-model="modalInfo.result">
                      <a-radio :disabled="modalInfo.result != 0" :value="0">进行中</a-radio>
                      <a-radio :disabled="modalInfo.result != 1" :value="1">已完成</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
          <div
            :style="{
              position: 'absolute',
              right: 10,
              bottom: 0,
              width: '720px',
              borderTop: '1px solid #e9e9e9',
              padding: '9px 16px',
              background: '#fff',
              textAlign: 'right',
            }"
          >
            <a-button key="back" @click="onClose">关闭</a-button>
          </div>
        </a-drawer>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import ProjectInfo from '@/module/project/worklog/ProjectInfo'
import { getProjectsWithLogsnum, getProjectLogSummary, initpage } from '@/api/worklogQuery'

export default {
  name: 'ProjectLogQueryList',
  components: {
    STable,
    Ellipsis,
    ProjectInfo
  },
  data () {
    return {
      roles: [],
      types: [],
      cardHeight: 0,
      tableHeight: 0,
      projectColumns: [{
        title: '项目名称',
        dataIndex: 'projectName',
        // width: '90%'
      }, {
        title: '',
        dataIndex: 'logsNum',
        width: 60,
        scopedSlots: { customRender: 'logsNum' }
      }],
      projectPagination: { pageNumber: 1, pageSize: 25, totalCount: 1, totalPages: 1 },
      projectLogPagination: { pageNumber: 1, pageSize: 25, totalCount: 1 },
      listScrollHeight: 0,
      projectListHeight: 0,
      projectLogColumns: [{
        title: '',
        dataIndex: 'rowIndex',
        scopedSlots: { customRender: 'rowIndex' },
        width: '5%'
      },
      {
        title: '考勤日期',
        dataIndex: 'attendanceDate',
        width: '10%'
      },
      {
        title: '姓名',
        dataIndex: 'personName',
        width: '7%'
      },
      {
        title: '部门',
        dataIndex: 'deptName',
        width: '13%'
      },
      {
        title: '事件内容',
        dataIndex: 'worklog',
        width: '50%',
        scopedSlots: { customRender: 'worklog' }
      },
      {
        title: '项目比例',
        dataIndex: 'projectRate',
        width: '9%'
      },
      {
        title: '状态',
        dataIndex: 'auditStatusText',
        width: '6%'
      }],
      displayProjectsWithLogsnum: parameter => {
        return getProjectsWithLogsnum(Object.assign(parameter, this.projectQueryParam)).then(res => {
          if (res.code === 200) {
            res.body.pageNumber = res.body.pageNumber - 1
            this.projectPagination.pageNumber = res.body.pageNumber + 1
            this.projectPagination.totalCount = res.body.totalCount
            this.projectPagination.totalPages = res.body.totalPages
            if (this.projectPagination.totalCount === 0) {
              this.projectListHeight = window.innerHeight - 220 + 58
            } else {
              this.projectListHeight = window.innerHeight - 285 + 58
            }
            return res.body
          }
        })
      },
      loadProjectLogSummary: parameter => {
        return getProjectLogSummary(Object.assign(parameter, this.logQueryParam)).then(res => {
          if (res.code === 200) {
            this.projectLogPagination.pageNumber = res.body.pageNumber + 1
            this.projectLogPagination.totalCount = res.body.totalCount
            return res.body
          }
        })
      },
      projectSelectedRow: '',
      logSelectedRow: '',
      modalInfo: {},
      attendanceDate: [],
      projectQueryParam: { pageSize: 15, startDate: null, endDate: null },
      logQueryParam: { pageSize: 25, startDate: null, endDate: null, inputContent: '', projectId: '' },
      dateFormat: 'YYYY-MM-DD',
      detailTile: '',
      modalVisible: false,
      colTitle: '',
      userId: '',
      customStyle: 'border: 0;overflow: hidden',
      collapse: true,
      milepostName: '',
      showTipTag: false

    }
  },
  created () {
    this.getWidthAndHeight()
    this.initParam()
  },
  computed: {
    formHeight: function () {
      if (this.collapse) {
        return (window.innerHeight - 200)
      } else {
        return (window.innerHeight - 200 - 200)
      }
    }
  },
  methods: {
    onRefresh () {
      this.projectPagination.pageNo = 1
      this.projectLogPagination.pageNo = 1
      this.projectQueryParam.startDate = this.attendanceDate[0].format('YYYY-MM-DD')
      this.projectQueryParam.endDate = this.attendanceDate[1].format('YYYY-MM-DD')
      this.logQueryParam.startDate = this.attendanceDate[0].format('YYYY-MM-DD')
      this.logQueryParam.endDate = this.attendanceDate[1].format('YYYY-MM-DD')
      this.projectSelectedRow = ''
      this.logSelectedRow = ''
      setTimeout(() => {
        this.$refs.projectTable.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
        this.$refs.logTable.refresh(true)
      }, 100)
    },
    onLogRefresh () {
      this.projectLogPagination.pageNo = 1
      this.logSelectedRow = ''
      this.modalInfo = {}
      setTimeout(() => {
        this.$refs.logTable.refresh(true)
      }, 100)
    },
    onProjectClickRow (record) {
      const me = this
      return {
        on: {
          click: () => {
            me.projectSelectedRow = record.projectId
            me.logQueryParam.projectId = record.projectId
            me.onLogRefresh()
          }
        }
      }
    },
    setProjectCurrentRow (record, index) {
      let styleClassName = ''
      if (record.projectId === this.projectSelectedRow) {
        styleClassName = 'clickRowStyle'
      }
      return styleClassName
    },
    onModalClickRow (record) {
      const me = this
      return {
        on: {
          click: () => {
            me.logSelectedRow = record.id
            me.modalInfo = record
            if (record.milepostId !== -1) {
              me.milepostName = record.milepostName
              me.showTipTag = true
            } else {
              me.showTipTag = false
            }
            me.showDrawer()
          }
        }
      }
    },
    setModalCurrentRow (record, index) {
      let styleClassName = ''
      if (record.id === this.logSelectedRow) {
        styleClassName = 'clickRowStyle'
      }
      return styleClassName
    },
    showDrawer () {
      this.detailTile = '(' + this.modalInfo.personName + '\xa0\xa0\xa0' + this.modalInfo.attendanceDate + ')'
      this.colTitle = this.modalInfo.projectName + '\xa0\xa0\xa0（' + this.modalInfo.areaText + '）'
      this.modalVisible = true
    },
    onClose () {
      this.modalVisible = false
    },
    collapseChange (key) {
      this.collapse = !this.collapse
      this.colTitle = this.modalInfo.projectName + '\xa0\xa0\xa0（' + this.modalInfo.areaText + '）'
    },
    moment,
    getWidthAndHeight () {
      this.listScrollHeight = window.innerHeight - 285
      this.projectListHeight = window.innerHeight - 285 + 58
      this.cardHeight = window.innerHeight - 85
    },
    initParam () {
      var theFirstDayOfMonth = moment().startOf('month') // 本月第一天
      var today = moment() // 今天
      this.attendanceDate.push(theFirstDayOfMonth, today)
      this.projectQueryParam.startDate = theFirstDayOfMonth.format('YYYY-MM-DD')
      this.projectQueryParam.endDate = today.format('YYYY-MM-DD')
      this.logQueryParam.startDate = theFirstDayOfMonth.format('YYYY-MM-DD')
      this.logQueryParam.endDate = today.format('YYYY-MM-DD')
      initpage()
        .then(res => {
          if (res.code === 200) {
            this.roles = res.body.roles
            this.types = res.body.types
          }
        })
    }
  }
}
</script>

<style scoped>
  /deep/ .ant-collapse .ant-collapse-item .ant-collapse-header .anticon {
    left: initial;
    right: 16px;
    padding-bottom: 10px;
  }
  /deep/ .ant-collapse > .ant-collapse-item > .ant-collapse-header{
    position: relative;
    padding: 0 0 12px 0;
    line-height: 22px;
    cursor: pointer;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
    font-size: 16px;
    color: rgba(0,0,0,.85);
    background: white;
  }
  /deep/ .ant-collapse-borderless > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding-top: 4px;
    background: white;
  }
  .form-style {
    overflow-x: hidden;
    overflow-y: scroll;
  }
  /deep/ .ant-table-placeholder {
    position: absolute;
    z-index: 1;
    padding: 16px 16px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    text-align: center;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 0 0 4px 4px;
    margin-top: 1px;
    top:36px;
    width:100%
  }
</style>
