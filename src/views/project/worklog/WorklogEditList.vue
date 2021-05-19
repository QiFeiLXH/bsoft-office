<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '24px 10px'
    }">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="8" :sm="24">
            <a-form-item>
              <a-range-picker :style="{'margin-left':'10px','width': '100%'}" v-model="attendanceDate" @change="onRefresh" :placeholder="['考勤开始日期', '考勤结束日期']"/>
            </a-form-item>
          </a-col>
          <!--            <a-col :md="6" :sm="24">-->
          <!--              <a-form-item>-->
          <!--                <a-input placeholder="姓名" v-model="queryParam.userName" @pressEnter="onRefresh" style="width: 100%"/>-->
          <!--              </a-form-item>-->
          <!--            </a-col>-->
          <!--                <a-col :md="4" :sm="24" v-if="!dateShowFlag">-->
          <!--                  <span class="table-page-search-submitButtons">-->
          <!--                    <a-button type="primary" @click="openAuditForm(1)">同意</a-button>-->
          <!--                    <a-button style="margin-left: 8px" @click="openAuditForm(2)">不同意</a-button>-->
          <!--                  </span>-->
          <!--                </a-col>-->
          <a-col :md="2" :sm="24" style="padding: unset">
            <a-button type="primary" icon="search" @click="onRefresh"/>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :height="tableHeight"
      :data="searchProjects"
      :customRow="onModalClickRow"
      :rowClassName="setModalCurrentRow"
      :showSizeChanger="false"
      :pageSize="page.pageSize"
      :pageNum="page.pageNumber"
      :showPagination="true"
      :bodyStyle="{
        minHeight:listScrollHeight+'px'
      }"
      :scroll="{ x: false, y: listScrollHeight }"
    >

      <span slot="serial" slot-scope="text, record, index" v-if="page.pageNumber === 0">
        {{ index + 1 }}
      </span>
      <span slot="serial" slot-scope="text, record, index" v-else>
        {{ (pageNo-1)*page.pageSize +index + 1 }}
      </span>
      <span slot="auditType" slot-scope="text">
        <span :class="statusMap[text].class">{{ statusMap[text].text }}</span>
      </span>
      <span slot="attendanceDate" slot-scope="text">
        {{ text ? text.substring(0,10) : '' }}
      </span>
      <span slot="workLog" slot-scope="text">
        <a-tooltip placement="left" v-if="text.length > 100">
          <template slot="title">
            {{ text }}
          </template>
          {{ text.length > 150 ? text.substring(0,150)+'...' : text }}
        </a-tooltip>
        <span v-if="text.length <= 100">{{ text }}</span>
      </span>
      <span slot="description" slot-scope="text">
        <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
      </span>

    </s-table>
    <audit-form ref="createModal" @ok="handleOk"></audit-form>
    <a-drawer
      :title="'日志详细信息'+detailTile"
      placement="right"
      :closable="false"
      :width="720"
      @close="onClose"
      :visible="visible"
      :bodyStyle="{ padding: '0px 0px 0px 0px' }"
    >
      <a-card :bordered="false" :body-style="{padding:'10px 0px 0px 40px'}">
        <a-collapse :bordered="false" @change="collapseChange" :expand-icon-position="expandIconPosition">
          <a-collapse-panel :header="colTitle" key="1" :style="customStyle" >
            <project-info :projectInfo="projectInfo" userId="" widthStyle="100%"/>
            <span slot="extra" type="setting" @click="modifyProject" style="color: #1890FF;margin-right: 40px">修改</span>
            <a-modal
              style="top: 30px;"
              v-model="modalVisible"
              :width="1300"
              :maskClosable="false"
              :bodyStyle="{ height: modalHeight, paddingBottom: '10px' }"
              @cancel="onModalCancel"
              :destroyOnClose="true">
              <a-input-search :pressEnter="onSearch" :allowClear="true" placeholder="项目名称" style="width: 600px;margin-bottom: 10px" @search="onSearch" />
              <a-row>
                <a-col :span="14">
                  <a-table
                    size="small"
                    v-watermark
                    :loading="isLoading"
                    :scroll="{ x: 650,y: modalTableHeight }"
                    :rowKey="(record) => record.projectId"
                    :columns="modalColumns"
                    :dataSource="projectList"
                    :customRow="onProjectModalClickRow"
                    :rowClassName="setProjectModalCurrentRow"
                    :pagination="false"
                  >
                    <span slot="serial" slot-scope="text, record, index" v-if="modalPage.pageNumber === 0">
                      {{ index + 1 }}
                    </span>
                    <span slot="serial" slot-scope="text, record, index" v-else>
                      {{ (currentPage-1)*modalPage.pageSize +index + 1 }}
                    </span>
                    <span slot="renderCheck" slot-scope="text, record">
                      <div v-if="record.isCommon === 1">√</div>
                    </span>
                  </a-table>
                </a-col>
                <a-col :span="10">
                  <a-spin :spinning="spinning">
                    <div class="treeStyle" :style="{height: treeHeight + 'px'}">
                      <s-tree
                        ref="tree"
                        :dataSource="orgTree"
                        :openKeys.sync="openKeys"
                        :search="false"
                        :showTitle="true"
                        :showTime="false"
                        :time="time"
                        :selectKey="selectKey"
                        :noPlan="noPlan"
                        :checkPart="true"
                        :noProject="noProject"
                        @click="handleTreeClick"
                        @parentClick="parentClick"
                      />
                    </div>
                  </a-spin>
                </a-col>
              </a-row>
              <a-alert
                v-if="modalError"
                closable
                type="warning"
                style="margin-bottom: 10px;width: 20%;margin:0 auto;text-align: left"
                showIcon
                :message="waringMsg"
                @close="onErrorClose"/>
              <template slot="footer">
                <a-row>
                  <a-col :span="12">
                    <a-pagination
                      :total="modalPage.totalCount"
                      :pageSize.sync="modalPage.pageSize"
                      v-model="modalPage.pageNumber"
                      @change="onCurrentChange"/>
                  </a-col>
                  <a-col :span="12">
                    <a-radio-group v-if="!noPlan && !noProject" style="margin-right:167px" v-model="checkStatus" @change="planChange">
                      <a-radio :value="0">
                        未完成计划
                      </a-radio>
                      <a-radio :value="1">
                        全部计划
                      </a-radio>
                    </a-radio-group>

                    <a-button key="submit" type="primary" @click="onModalConfirm">
                      确定
                    </a-button>
                    <a-button key="back" @click="onModalCancel">关闭</a-button>
                  </a-col>
                </a-row>
              </template>
            </a-modal>
          </a-collapse-panel>
        </a-collapse>
      </a-card>
      <a-card :bordered="false" :body-style="{padding:'0px 24px 0px 24px'}" :style="{height: formHeight+'px'}" :class="formHeight <= 432 ? 'form-style':''">
        <!--        <a-form :form="form">-->
        <a-form :form="worklogForm" hideRequiredMark>
          <a-form-item
            label="范围"
            :labelCol="{lg: {span: 2}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
            :required="false"
            style="margin-bottom: 10px;"
          >
            <a-radio-group v-decorator="['range', {rules: [{required: true, message: '请选择范围' }],initialValue: ProWorkLogData.range }]">
              <a-radio :disabled="ProWorkLogData.range!= 1 && ProWorkLogData.plan != 2" :value="1">合同内</a-radio>
              <a-radio :disabled="ProWorkLogData.range!= 2 && ProWorkLogData.plan != 2" :value="2">合同外</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="计划"
            :labelCol="{lg: {span: 2}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
            :required="false"
            style="margin-bottom: 10px;"
          >
            <a-radio-group v-model="ProWorkLogData.plan">
              <a-radio :disabled="ProWorkLogData.plan != 1" :value="1">计划内</a-radio>
              <a-tooltip placement="right" v-if="PlanDetailData.id != null && PlanDetailData.id > 0 && PlanDetailData.milepostName.length > 19">
                <template slot="title">
                  {{ PlanDetailData.milepostName }}
                </template>
                <a-tag color="#87d068" v-if="PlanDetailData.id != null && PlanDetailData.id > 0 && PlanDetailData.milepostName.length >19">{{ PlanDetailData.milepostName.substring(0,19)+'...' }}</a-tag>
              </a-tooltip>
              <a-tag color="#87d068" v-if="PlanDetailData.id != null && PlanDetailData.id > 0 && PlanDetailData.milepostName.length <= 19">{{ PlanDetailData.milepostName }}</a-tag>
              <a-radio style="position:absolute;left:360px;bottom:-1px" :disabled="(ProWorkLogData.auditType != 0 || dateShowFlag) && ProWorkLogData.plan != 2" :value="2">计划外</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="角色"
            :labelCol="{lg: {span: 2}, sm:{span: 2}}"
            :wrapperCol="{lg: {span: 22}, sm:{span: 17}}"
            :required="false"
            style="margin-bottom: 10px;"
          >
            <a-radio-group v-model="ProWorkLogData.role">
              <a-radio-button :disabled="(ProWorkLogData.auditType !== 0 || dateShowFlag) && ProWorkLogData.role !== item.id" :value="item.id" v-for="(item,index) in roles" :key="index">{{ item.name }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="方式"
            :labelCol="{lg: {span: 2}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
            :required="false"
            style="margin-bottom: 10px;"
          >
            <a-radio-group v-model="ProWorkLogData.model">
              <a-radio :disabled="(ProWorkLogData.auditType != 0 || dateShowFlag) && ProWorkLogData.model != 1" :value="1">现场</a-radio>
              <a-radio :disabled="(ProWorkLogData.auditType != 0 || dateShowFlag) && ProWorkLogData.model != 2" :value="2">远程</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="类别"
            :labelCol="{lg: {span: 2}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 22}, sm: {span: 17} }"
            :required="false"
            style="margin-bottom: 10px;"
          >
            <a-radio-group v-model="ProWorkLogData.type">
              <a-radio-button :disabled="(ProWorkLogData.auditType !== 0 || dateShowFlag) && ProWorkLogData.type !== item.id" :value="item.id" v-for="(item,index) in types" :key="index">{{ item.name }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="内容"
            :labelCol="{lg: {span: 2}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 20}, sm: {span: 17} }"
            style="margin-bottom: 10px;">
            <a-textarea
              :readonly="ProWorkLogData.auditType != 0 || dateShowFlag"
              rows="4"
              v-decorator="['workLog',{rules: [{required: true, message: '请输入内容' }],initialValue:ProWorkLogData.workLog}]"
            />
          </a-form-item>
          <a-row>
            <a-col span="12">
              <a-form-item
                label="工时"
                :labelCol="{lg: {span: 4}, sm: {span: 7}}"
                :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
                :required="false"
                style="margin-bottom: 10px;"
              >
                <a-input-number v-if="ProWorkLogData.auditType == 0 && !dateShowFlag" :min="0.1" :precision="1" :max="24" v-decorator="['workload', {rules: [{required: true, message: '请填写工时' }], initialValue:ProWorkLogData.workload }]"/>
                <a-input v-if="ProWorkLogData.auditType != 0 || dateShowFlag" :readonly="true" style="width:80%" v-decorator="['workload', {rules: [{required: true, message: '请填写工时' }], initialValue:ProWorkLogData.workload }]"/>h
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item
                label="事件结果:"
                :labelCol="{lg: {span: 6}, sm: {span: 6}}"
                :wrapperCol="{lg: {span: 18}, sm: {span: 18} }"
                :required="false"
                style="margin-bottom: 10px;"
              >
                <a-radio-group v-model="ProWorkLogData.result">
                  <a-radio :disabled="(ProWorkLogData.auditType != 0 || dateShowFlag) && ProWorkLogData.result != 0" :value="0">进行中</a-radio>
                  <a-radio :disabled="(ProWorkLogData.auditType != 0 || dateShowFlag) && ProWorkLogData.result != 1" :value="1">已完成</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item
            v-if="modifyFlag"
            label="意见"
            :labelCol="{lg: {span: 2}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 20}, sm: {span: 17} }"
            style="margin-bottom: 10px;">
            <a-textarea :readonly="true" rows="4" v-model="ProWorkLogData.remark" />
          </a-form-item>
        </a-form>
      </a-card>
      <footer-tool-bar style="width:720px;height:92px;" v-if="!dateShowFlag && !modifyFlag && visible">
        <a-form-item
          label="意见"
          :labelCol="{lg: {span: 2}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 20}, sm: {span: 17} }"
          style="margin-bottom: 10px;">
          <a-textarea
            style="width: 658px;height: 32px;margin-top: 10px;"
            v-model="remark"
            rows="4"
            placeholder="请输入您的审核意见"
            v-decorator="['remark',{rules: [{required: true, message: '不同意请输入意见' }]}]"
          />
        </a-form-item>
        <a-alert
          v-if="errorShow"
          :showIcon="false"
          style="width: 50%;margin-left: 55px;float: left;padding: 0 0 0 5px;margin-top: -10px;background-color: white;color: #f5222d;;"
          type="error"
          message="不同意请输入意见！"
          banner />
        <!--          <label>意见：</label>-->
        <!--          <a-input v-model="remark" style="width:auto;margin-right:10px;" placeholder="请输入您的审核意见"-->
        <!--                   v-decorator="['remark', {rules: [{required: true, min: 1, message: '请输入意见'}]}]"/>-->
        <a-button @click="Audit(2)" style="margin-left: 20px;float:right;margin-right: 55px;">不同意</a-button>
        <a-button htmlType="submit" style="margin-left: 8px;float:right;" @click="Audit(1)" type="primary">同意</a-button>
      </footer-tool-bar>
      <footer-tool-bar style="width:720px;" v-if="!dateShowFlag && modifyFlag && visible">
        <a-button htmlType="submit" @click="saveWorkLog(1)" type="primary">保存</a-button>
        <a-button @click="saveWorkLog(2)" style="margin-left: 20px">取消</a-button>
      </footer-tool-bar>
    </a-drawer>
  </a-card>
</template>

<script>
import './style.less'
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import FooterToolBar from '@/components/FooterToolbar'
import AuditForm from './AuditForm'
import ProjectInfo from '@/module/project/worklog/ProjectInfo'
import STree from '@/components/PlanTree/Tree'
import { getWorkLogList, saveWorkLogDetails, getWorkLogById, saveWorkLog, getProjectWithAuditList, initpage, searchProjects, doLoadProjectPlanTree } from '@/api/worklogEdit'

const modalColumns = [
  {
    title: '序号',
    scopedSlots: { customRender: 'serial' },
    width: 80
  },
  {
    title: '常用',
    scopedSlots: { customRender: 'renderCheck' },
    width: 50
  },
  {
    title: '合同号',
    dataIndex: 'contractNo',
    width: 100
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    width: 390
  },
  {
    title: '项目经理',
    dataIndex: 'projectManagerText',
    width: 80
  },
  {
    title: '归属部门',
    dataIndex: 'areaText',
    width: 130
  },
  {
    title: '归属类别',
    dataIndex: 'flagText',
    width: 80
  }
]
export default {
  name: 'WorklogEditList',
  components: {
    STable,
    Ellipsis,
    AuditForm,
    FooterToolBar,
    ProjectInfo,
    STree
  },
  data () {
    return {
      types: [],
      roles: [],
      projectSelectedRow: '',
      projectQueryParam: {
        pageSize: 25
      },
      projectPage: { pageNumber: 1, pageSize: 25, totalCount: 1, totalPages: 1 },
      auditProjectList: [],
      projedctColumns: [{
        title: '项目名称',
        dataIndex: 'projectName',
        width: '95%'
      }, {
        title: '',
        dataIndex: 'countNum',
        width: '5%',
        scopedSlots: { customRender: 'countNum' }
      }],
      auditProjects: parameter => {
        return getProjectWithAuditList(Object.assign(parameter, this.projectQueryParam))
          .then(res => {
            if (res.code === 200) {
              this.projectPage.pageNumber = res.body.pageNumber
              this.projectPage.pageSize = res.body.pageSize
              this.projectPage.totalCount = res.body.totalCount
              this.projectPage.totalPages = res.body.totalPages
              this.auditProjectList = res.body.items
              if (this.projectPage.totalCount === 0) {
                this.projectListHeight = window.innerHeight - 285 - 106 + 58
              } else {
                this.projectListHeight = window.innerHeight - 285 + 58
              }
              return res.body
            }
          })
      },
      pageNo: 1,
      statusMap: {
        0: {
          class: 'table-info-row-red',
          status: 'default',
          text: '待修改'
        },
        1: {
          class: 'table-info-row-blue',
          status: 'processing',
          text: '待审核'
        },
        2: {
          class: 'table-info-row-blue',
          status: 'processing',
          text: '待审核'
        },
        3: {
          class: 'table-info-row-blue',
          status: 'processing',
          text: '待审核'
        },
        4: {
          class: 'table-info-row-green',
          status: 'success',
          text: '结束'
        }
      },
      page: { pageNumber: 1, pageSize: 25, totalCount: 1 },
      customStyle:
        'border: 0;overflow: hidden',
      pageSizeOptions: ['10', '25', '50', '75', '100'],
      tableHeight: window.innerHeight - 200,
      tableWidth: window.innerWidth * 0.7,
      dateShowFlag: false, // 考勤日期是否显示标志；全部和已审按考勤日期时间段查询，默认选择待审，考勤日期隐藏
      modifyFlag: false, // 待组员修改 标志
      attendanceDate: null,
      dateFormat: 'YYYY/MM/DD',
      visible: false,
      showFlag: true,
      saveData: [], // 日志审核明细信息集合
      remark: '', // 审核意见
      mdl: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        listFlag: 3,
        flag: 1,
        pageSize: 25
      },
      ProWorkLogData: {

      },
      PlanDetailData: {

      },
      proWorkLogList: [],
      firstFlag: false, // 单条审核 连续审核标志
      // 表头
      columns: [
        {
          title: '序号',
          width: '6%',
          scopedSlots: { customRender: 'serial' }
        },
        // {
        //   title: '待审核人',
        //   width: '5%',
        //   dataIndex: 'auditter'
        // },
        {
          title: '类型',
          width: '8%',
          dataIndex: 'auditType',
          scopedSlots: { customRender: 'auditType' }
        },
        {
          title: '考勤日期',
          width: '12%',
          dataIndex: 'attendanceDate',
          scopedSlots: { customRender: 'attendanceDate' }
        },
        {
          title: '工作事件',
          width: '52%',
          dataIndex: 'workLog',
          scopedSlots: { customRender: 'workLog' }
        },
        {
          title: '状态',
          width: '8%',
          dataIndex: 'auditFlagText'
        },
        {
          title: '剩余天数',
          width: '8%',
          dataIndex: 'remainingDays'
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      searchProjects: parameter => {
        if (this.attendanceDate && this.attendanceDate.length > 0) {
          this.queryParam.startDate = this.Time(this.attendanceDate[0].valueOf())
          this.queryParam.endDate = this.Time(this.attendanceDate[1].valueOf())
        } else {
          this.queryParam.startDate = null
          this.queryParam.endDate = null
        }
        return getWorkLogList(Object.assign(parameter, this.queryParam))
          .then(res => {
            if (res.code === 200) {
              this.page.pageNumber = res.body.pageNumber + 1
              this.pageNo = res.body.pageNumber + 1
              this.page.pageSize = res.body.pageSize
              this.page.totalCount = res.body.totalCount
              this.proWorkLogList = res.body.items
              if (this.firstFlag && this.proWorkLogList.length > 0) {
                this.modalSelectedRow = this.proWorkLogList[0].id
                this.modalProjectInfo = this.proWorkLogList[0]
                this.showDrawer()
                this.worklogForm.resetFields()
              } else {
                this.onClose()
              }
              if (this.page.totalCount === 0) {
                this.listScrollHeight = window.innerHeight - 120
              } else {
                this.listScrollHeight = window.innerHeight - 260
              }
              return res.body
            }
          })
      },
      selectedRowKeys: [],
      selectedRows: [],

      // custom table alert & rowSelection
      options: {
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange,
          getCheckboxProps: record => ({
            props: {
              disabled: record.auditType === 0, // Column configuration not to be checked
              name: 's' + record.auditType
            }
          })
        }
      },
      optionAlertShow: false,
      modalProjectInfo: '',
      modalSelectedRow: '',
      detailTile: '',
      listScrollHeight: 0,
      projectListHeight: 0,
      cardHeight: 0,
      collapse: true,
      colTitle: '',
      projectInfo: {},
      errorShow: false,
      isLoading: false,
      spinning: false,
      modalPage: { pageNumber: 1, pageSize: 25, totalCount: 1 },
      modalHeight: window.innerHeight - 190 - 130,
      modalTableHeight: window.innerHeight - 180 - 110,
      treeHeight: window.innerHeight - 180 - 60,
      modalQueryParam: { 'context': '', pageSize: 25 },
      modalVisible: false,
      expandIconPosition: 'right',
      projectList: [],
      currentPage: 1,
      projectModalSelectedRow: '',
      projectModalSelectedInfo: {},
      modalColumns,
      orgTree: [],
      openKeys: [],
      selectKey: [],
      noPlan: false,
      noProject: true,
      modalError: false,
      waringMsg: '',
      time: [],
      selectItem: { milepostId: null, milepostName: '', range: null },
      worklogForm: this.$form.createForm(this, { name: 'coordinated' }),
      projectChangeFlag: false,
      needSaveProjectInfo: { projectId: '', contractNo: '' },
      currentContractNo: '',
      checkStatus: 0
    }
  },
  filters: {
    statusFilter (type) {
      return this.statusMap[type].text
    },
    statusTypeFilter (type) {
      return this.statusMap[type].status
    }
  },
  created () {
    this.getWidthAndHeight()
    this.initRoleAndType()
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
    initRoleAndType () {
      initpage()
        .then(res => {
          if (res.code === 200) {
            this.roles = res.body.roles
            this.types = res.body.types
          }
        })
    },
    onRefresh () {
      this.page.pageNumber = 1
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onProjectRefresh () {
      this.projectQueryParam.pageNo = 1
      this.projectQueryParam.pageNumber = 1
      setTimeout(() => {
        this.$refs.projectTable.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onProjectChange (current) {
      this.projectQueryParam.pageNo = current
      setTimeout(() => {
        this.$refs.projectTable.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onChange (current) {
      this.queryParam.pageNo = current
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onShowSizeChange (current, pageSize) {
      this.page.pageSize = pageSize
      this.page.pageNumber = 1
      this.pageNo = 1
      this.queryParam.pageNo = 1
      this.queryParam.pageSize = pageSize
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    collapseChange (key) {
      this.collapse = !this.collapse
      this.colTitle = this.projectInfo.projectName + '\xa0\xa0\xa0（' + this.projectInfo.areaText + '）'
    },
    modifyProject () {
      this.modalVisible = true
      this.modalQueryParam.context = ''
      this.modalQueryParam.pageNo = 1
      this.projectModalSelectedRow = ''
      this.projectModalSelectedInfo = {}
      this.modalPage.pageNumber = 1
      this.orgTree = []
      this.openKeys = []
      this.selectKey = []
      this.projectList = []
      this.noProject = true
      this.currentContractNo = ''
      this.checkStatus = 0
      this.loadProjectList()
    },
    onSearch (value) {
      this.modalQueryParam.context = value.trim()
      this.modalQueryParam.pageNo = 1
      this.loadProjectList()
    },
    loadProjectList () {
      this.isLoading = true
      searchProjects(this.modalQueryParam)
        .then(res => {
          if (res.code === 200) {
            this.modalPage.pageNumber = res.body.pageNumber
            this.modalPage.pageSize = res.body.pageSize
            this.modalPage.totalCount = res.body.totalCount
            this.projectList = res.body.items
            this.currentPage = res.body.pageNumber
          }
          this.isLoading = false
        })
    },
    loadProjectPlanTree (contractNo, projectId, part) {
      this.spinning = !this.spinning
      const param = { 'contractNo': contractNo, 'projectId': projectId, 'part': part }
      doLoadProjectPlanTree(param).then(res => {
        if (res.code === 200) {
          this.orgTree = res.body.planTree
          this.openKeys = res.body.openKeys
          this.noPlan = res.body.noPlan
          if (this.noPlan) {
            this.selectKey = [-1]
            this.planName = '计划外'
            this.ProWorkLogData.plan = 2
            this.PlanDetailData.id = null
            this.selectItem.milepostId = -1
            this.selectItem.milepostName = '计划外'
            this.selectItem.range = null
          }
        } else {
          this.$message.error(res.msg)
        }
        this.spinning = !this.spinning
      })
    },
    onProjectModalClickRow (record) {
      const me = this
      return {
        on: {
          click: () => {
            me.projectModalSelectedRow = record.projectId
            me.projectModalSelectedInfo = record
            me.currentContractNo = record.contractNo
            me.selectKey = []
            me.noProject = false
            me.checkStatus = 0
            me.loadProjectPlanTree(record.contractNo, record.projectId, this.checkStatus)
          }
        }
      }
    },
    setProjectModalCurrentRow (record, index) {
      let styleClassName = ''
      if (record.projectId === this.projectModalSelectedRow) {
        styleClassName = 'clickRowStyle'
      }
      return styleClassName
    },
    onCurrentChange (current) {
      this.modalQueryParam.pageNo = current
      this.projectModalSelectedRow = ''
      this.projectModalSelectedInfo = {}
      this.orgTree = []
      this.openKeys = []
      this.selectKey = []
      this.projectList = []
      this.noProject = true
      this.currentContractNo = ''
      this.checkStatus = 0
      this.loadProjectList()
    },
    onModalConfirm () {
      if (this.projectModalSelectedRow === '') {
        this.modalError = true
        this.waringMsg = '请先选择一个项目！'
        return
      }
      if (this.selectKey.length === 0) {
        this.modalError = true
        this.waringMsg = '请选择计划阶段！'
        return
      }
      this.resetFormValue()
      this.orgTree = []
      this.openKeys = []
      this.selectKey = []
      this.projectList = []
      this.modalVisible = false
      this.modalError = false
      this.noPlan = false
      this.noProject = true
    },
    onModalCancel () {
      this.modalVisible = false
      this.modalError = false
      this.projectList = []
      this.orgTree = []
      this.openKeys = []
      this.selectKey = []
      this.noPlan = false
      this.noProject = true
      this.checkStatus = 0
    },
    onErrorClose () {
      this.modalError = false
    },
    parentClick: function (item) {
      this.selectKey = [item.id]
      this.selectItem = item
      this.selectItem.milepostId = item.id
    },
    // 树选中方法
    handleTreeClick: function (e) {
      this.selectKey = [e.key]
      this.selectItem = e.item.value
      this.selectItem.milepostId = e.key
    },
    planChange (e) {
      this.checkStatus = e.target.value
      this.loadProjectPlanTree(this.currentContractNo, this.projectModalSelectedRow, e.target.value)
      this.selectKey = []
      this.noProject = false
    },
    resetFormValue () {
      /* 项目详情赋值 */
      this.projectInfo.signDate = this.projectModalSelectedInfo.signDate
      this.projectInfo.areaText = this.projectModalSelectedInfo.areaText
      this.projectInfo.projectManagerText = this.projectModalSelectedInfo.projectManagerText
      this.projectInfo.customerName = this.projectModalSelectedInfo.customerName
      this.projectInfo.classification = this.projectModalSelectedInfo.classification
      this.projectInfo.grade = this.projectModalSelectedInfo.grade
      this.projectInfo.region = this.projectModalSelectedInfo.region
      this.projectInfo.projectName = this.projectModalSelectedInfo.projectName
      this.projectInfo.projectId = this.projectModalSelectedInfo.projectId

      /* 合同内外、计划内外重新赋值 */
      this.PlanDetailData.milepostName = this.selectItem.milepostName
      this.ProWorkLogData.range = this.selectItem.range
      this.ProWorkLogData.projectId = this.projectModalSelectedInfo.projectId
      this.ProWorkLogData.milepostId = this.selectItem.milepostId
      if (this.selectItem.milepostId === -1) {
        this.ProWorkLogData.plan = 2
        this.PlanDetailData.id = null
      } else {
        this.ProWorkLogData.plan = 1
        this.PlanDetailData.id = this.selectItem.milepostId
      }
      this.worklogForm.resetFields()

      this.colTitle = this.projectInfo.projectName + '\xa0\xa0\xa0（' + this.projectInfo.areaText + '）'
    },
    validate (val) {
      var validateResult = true
      if (val === 1) {
        this.worklogForm.validateFields((err, values) => {
          if (err) {
            validateResult = false
          }
        })
      }
      return validateResult
    },
    Time (value) {
      const dateee = new Date(value).toJSON()
      const date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
      return date.substring(0, 10)
    },
    moment,
    getWidthAndHeight () {
      this.listScrollHeight = window.innerHeight - 120
      this.projectListHeight = window.innerHeight - 285 + 58
      this.cardHeight = window.innerHeight - 85
    },
    momentDate (text) {
      return moment(text, this.dateFormat)
    },
    handleEdit (record) {
      this.$refs.modal.edit(record)
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
      if (this.advanced) {
        this.listScrollHeight = window.innerHeight - 345
        this.projectListHeight = window.innerHeight - 345 + 58
      } else {
        this.listScrollHeight = window.innerHeight - 120
        this.projectListHeight = window.innerHeight - 260 + 58
      }
    },
    onChangeFlag (e) {
      const value = e.target.value
      this.queryParam.listFlag = value
      if (value === 3) {
        this.dateShowFlag = false
        this.attendanceDate = []
        this.queryParam.auditType = [0, 1, 2, 3]
      } else {
        this.dateShowFlag = true
        // this.attendanceDate = [moment('2020/01/01', this.dateFormat), moment('2020/01/31', this.dateFormat)]
        if (value === 1) {
          this.queryParam.auditType = []
        } else {
          this.queryParam.auditType = []
        }
      }
      this.onRefresh()
    },
    openAuditForm (flag) {
      var me = this
      if (this.selectedRows.length <= 0) {
        this.$message.error('请至少选择一条数据！')
        return
      }
      if (flag === 2) {
        this.$refs.createModal.add(flag)
      } else {
        this.$confirm({ // 确定和关闭按钮 调换位置（只是调换了样式，和方法）
          title: '是否批量同意所选日志？',
          cancelText: '确定',
          okText: '关闭',
          okButtonProps: {
            props: {
              type: 'default'
            }
          },
          cancelButtonProps: {
            props: {
              type: 'primary'
            }
          },
          onOk () {

          },
          onCancel () {
            me.handleOk({
              flag: 1
            })
          }
        })
      }
    },
    onProjectClickRow (record) {
      const me = this
      return {
        on: {
          click: () => {
            me.projectSelectedRow = record.projectId
            me.queryParam.projectId = record.projectId
            me.onRefresh()
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
            me.modalSelectedRow = record.id
            this.modalProjectInfo = record
            this.showDrawer()
          }
        }
      }
    },
    setModalCurrentRow (record, index) {
      let styleClassName = ''
      if (record.id === this.modalSelectedRow) {
        styleClassName = 'clickRowStyle'
      }
      return styleClassName
    },
    showDrawer () {
      const me = this
      this.remark = ''
      this.saveData = []
      getWorkLogById({
        proWorkLogId: this.modalSelectedRow,
        projectId: this.modalProjectInfo.gsxm
      })
        .then(res => {
          me.ProWorkLogData = res.body.projectLog
          me.PlanDetailData = res.body.planDetail
          me.projectInfo = res.body.projectInfo
          me.colTitle = me.projectInfo.projectName + '\xa0\xa0\xa0（' + me.projectInfo.areaText + '）'
          var attendanceDate = ''
          if (this.modalProjectInfo.attendanceDate != null) {
            attendanceDate = '\xa0\xa0\xa0' + this.modalProjectInfo.attendanceDate.substring(0, 10)
          }
          me.detailTile = '(' + this.modalProjectInfo.userName + attendanceDate + ')'
          if (me.ProWorkLogData.auditType === 0) {
            me.modifyFlag = true
          } else {
            me.modifyFlag = false
          }
          // 将表单验证项初始化，防止修改后未保存又打开时呈现旧数据
          this.worklogForm.resetFields()
          me.visible = true
        })
    },
    handleOk (remarkData) {
      const me = this
      this.saveData = []
      for (const row of this.selectedRows) {
        const data = {
          id: row.id,
          projectId: row.gsxm,
          contractNo: row.contractNo,
          submitter: row.yggh,
          refuse: row.refuse,
          verifyHours: row.workLoad,
          workLogId: row.workLogId,
          auditType: row.auditType,
          auditFlag: remarkData.flag,
          remark: remarkData.remark
        }
        this.saveData.push(data)
      }
      saveWorkLogDetails(this.saveData).then(res => {
        if (res.code === 200) {
          this.$message.success('审批成功')
          me.onRefresh()
          me.onProjectRefresh()
          me.saveData = []
          me.$refs.table.clearSelected()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    onClose () {
      this.visible = false
      this.firstFlag = false
    },
    saveWorkLog (flag) {
      if (!this.validate(flag)) { // 表单校验是否存在未填项
        return
      }
      const worklogForm = this.worklogForm.getFieldsValue()
      this.ProWorkLogData.range = worklogForm.range
      this.ProWorkLogData.workLog = worklogForm.workLog
      this.ProWorkLogData.workload = worklogForm.workload
      this.firstFlag = true
      if (flag === 1) { // 保存
        /* 判断日志项目是否已改变 */
        if (this.projectInfo.projectId === this.modalProjectInfo.gsxm) {
          this.projectChangeFlag = false
          this.needSaveProjectInfo.projectId = this.modalProjectInfo.gsxm
          this.needSaveProjectInfo.contractNo = this.modalProjectInfo.contractNo
        } else {
          this.projectChangeFlag = true
          /* 待提交数据的重新赋值 */
          this.needSaveProjectInfo.projectId = this.projectModalSelectedInfo.projectId
          this.needSaveProjectInfo.contractNo = this.projectModalSelectedInfo.contractNo
        }
        const projectLogs = []
        projectLogs.push(this.ProWorkLogData)
        const param = {
          'projectLogs': projectLogs,
          'projectName': this.projectInfo.projectName,
          'projectId': this.needSaveProjectInfo.projectId,
          'contractNo': this.needSaveProjectInfo.contractNo,
          'projectChangeFlag': this.projectChangeFlag
        }
        saveWorkLog(param).then(res => {
          if (res.code === 200) {
            this.onRefresh()
            // this.onProjectRefresh()
            this.$message.success('保存成功')
            // this.onClose()
          } else {
            this.$message.error(res.msg)
          }
        })
      } else {
        this.onClose()
      }
    },
    Audit (flag) {
      this.firstFlag = true
      if (flag === 2 && this.remark === '') {
        this.errorShow = true
        // this.$message.error("不同意请输入意见！")
        return
      } else {
        this.errorShow = false
      }
      const me = this
      const data = {
        id: this.modalSelectedRow,
        projectId: this.modalProjectInfo.gsxm,
        submitter: this.modalProjectInfo.yggh,
        workLogId: this.modalProjectInfo.workLogId,
        refuse: this.modalProjectInfo.refuse,
        verifyHours: this.modalProjectInfo.workLoad,
        auditType: this.modalProjectInfo.auditType,
        contractNo: this.modalProjectInfo.contractNo,
        auditFlag: flag,
        remark: this.remark
      }
      this.saveData.push(data)
      saveWorkLogDetails(this.saveData)
        .then(res => {
          if (res.code === 200) {
            this.$message.success('审批成功')
            me.onRefresh()
            me.onProjectRefresh()
            me.saveData = []
            // me.onClose()
          } else {
            this.$message.error(res.msg)
          }
        })
    }
  }
}
</script>
<style lang="less" scoped>
  .form-style {
    overflow-x: hidden;
    overflow-y: scroll;
  }
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
  /*/deep/ .ant-card-body {*/
  /*  padding: 0px 24px 24px 24px;*/
  /*  zoom: 1;*/
  /*}*/

  .treeStyle {
    padding-top: 0px;
    background: white;
    overflow-x:hidden;
    overflow-y:scroll;
  }
  /deep/ .ant-collapse-borderless > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding-top: 4px;
    background: white;
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
