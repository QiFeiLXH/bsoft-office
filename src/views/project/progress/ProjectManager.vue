<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <a-row style="margin-bottom: 10px;margin-top:10px;">
      <a-col>
        <a-input-search
          :pressEnter="doQuery"
          :allowClear="true"
          v-model="queryParam.inputContent"
          placeholder="部门名称/合同号/项目名称"
          style="width: 300px;"
          @search="doQuery"/>
        <a-divider type="vertical"/>
        <person-select v-model="queryParam.progressManager" placeholder="进度经理工号、姓名、简拼检索" style="width: 250px" @change="handleProgressManagerChange" :allowClear="true"></person-select>
        <a-divider type="vertical"/>
        <a-checkbox-group :value="queryParam.maintainFlag" :options="plainOptions" @change="handleMaintainChange"/>
        <a-divider type="vertical"/>
        <a-button type="primary" icon="search" @click="doQuery">查询</a-button>
      </a-col>
    </a-row>
    <s-table
      v-watermark
      class="custom watermarkClass"
      ref="table"
      size="small"
      :rowKey="(record) => record.projectId"
      :columns="columns"
      :data="loadProjectList"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :showSizeChanger="false"
      :pageSize="pagination.pageSize"
      :pageNum="pagination.pageNumber"
      :showPagination="true"
      :bodyStyle="{ height: listScrollHeight+'px' }"
      :scroll="{ x: false, y: listScrollHeight }"
    >
      <template slot="rowIndex" slot-scope="text, record, index">
        {{ (pagination.pageNumber - 1) * pagination.pageSize + index + 1 }}
      </template>
      <template slot="collectionDeptName" slot-scope="text">
        <a-tooltip>
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="projectName" slot-scope="text">
        <a-tooltip>
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="projectManagerName" slot-scope="text, record">
        <span :style="record.logout === '1' ? { color: 'red' } : ''">{{text}}</span>
      </template>
      <template slot="reportFlag" slot-scope="text">
        <a-checkbox :checked="text === 1"/>
      </template>
      <template slot="operation" slot-scope="text, record">
        <a @click="doOperate(record, 'maintain')">维护</a>
      </template>
    </s-table>
    <a-drawer
      :title="drawerTitle"
      :wrapStyle="{overflow: 'hidden'}"
      placement="right"
      :closable="false"
      :width="600"
      @close="onDrawerClose"
      :visible="drawerVisible"
      :bodyStyle="{ padding: '0px 0px 0px 0px' }"
    >
      <a-spin :spinning="isSpinning">
        <a-card :bordered="false" :body-style="{ height:drawerCardHeight + 'px',padding:'10px 0px 0px 10px'}" v-watermark>
          <div :style="{ height: formHeight + 'px',paddingBottom: '50px', overflowY: 'auto' }">
            <a-form-model :model="projectManagerForm" ref="projectManagerForm" :rules="projectManagerFormRules">
              <a-form-model-item
                label="项目名称"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="projectName"
                style="margin-bottom: 10px;"
                class="ant-input-affix-wrapper"
              >
                <a-input
                  class="ant-input-border-bottom-only"
                  v-model="projectManagerForm.projectName"
                  style="width: 400px;color: #000000;border-top: 0px;border-left: 0px;border-right: 0px;border-bottom: 1px solid #000000;border-radius: 0px;"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="合同号"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="contractNo"
                style="margin-bottom: 10px;"
                class="ant-input-affix-wrapper"
              >
                <a-input
                  v-model="projectManagerForm.contractNo"
                  style="width: 400px;color: #000000;border-top: 0px;border-left: 0px;border-right: 0px;border-bottom: 1px solid #000000;border-radius: 0px;"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="业务大类"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="businessTypeName"
                style="margin-bottom: 10px;"
                class="ant-input-affix-wrapper"
              >
                <a-input
                  v-model="projectManagerForm.businessTypeName"
                  style="width: 400px;color: #000000;border-top: 0px;border-left: 0px;border-right: 0px;border-bottom: 1px solid #000000;border-radius: 0px;"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="回款业绩部门"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="collectionDeptName"
                style="margin-bottom: 15px;"
                class="ant-input-affix-wrapper"
              >
                <a-input
                  v-model="projectManagerForm.collectionDeptName"
                  style="width: 400px;color: #000000;border-top: 0px;border-left: 0px;border-right: 0px;border-bottom: 1px solid #000000;border-radius: 0px;"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="项目经理"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="projectManager"
                style="margin-bottom: 10px;"
              >
                <person-select ref="projectManager" v-model="projectManagerForm.projectManager" style="width: 400px;color: #000000" :disabled="readOnly" @change="onProjectManagerChange"></person-select>
              </a-form-model-item>
              <a-form-model-item
                label="进度经理"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="progressManager"
                style="margin-bottom: 10px;"
              >
                <person-select ref="progressManager" v-model="projectManagerForm.progressManager" style="width: 400px;color: #000000" :disabled="readOnly" @change="onProgressManagerChange"></person-select>
              </a-form-model-item>
              <a-form-model-item
                label="需上报进度"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="registrantName"
                style="margin-bottom: 10px;"
              >
                <a-switch v-if="$auth(this.$route.meta.id + '.2')" :checked="projectManagerForm.reportFlag === 1" @change="onReportFlagChange"/>
                <a-switch v-else :checked="projectManagerForm.reportFlag === 1"/>
              </a-form-model-item>
              <a-form-model-item
                label="维护人"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="registrantName"
                style="margin-bottom: 10px;"
                class="ant-input-affix-wrapper"
              >
                <a-input
                  v-model="projectManagerForm.registrantName"
                  style="width: 400px;color: #000000;border-top: 0px;border-left: 0px;border-right: 0px;border-bottom: 1px solid #000000;border-radius: 0px;"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="维护日期"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="registrantDate"
                style="margin-bottom: 10px;"
                class="ant-input-affix-wrapper"
              >
                <a-input
                  v-model="projectManagerForm.registrantDate"
                  style="width: 400px;color: #000000;border-top: 0px;border-left: 0px;border-right: 0px;border-bottom: 1px solid #000000;border-radius: 0px;"
                  :readOnly="true"/>
              </a-form-model-item>
            </a-form-model>
          </div>
          <div
            :style="{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '950px',
              borderTop: '1px solid #e9e9e9',
              padding: '9px 16px',
              background: '#fff',
              textAlign: 'right',
            }"
          >
            <a-button
              type="primary"
              @click="onSaveForm">保存
            </a-button>
            <a-button
              style="margin-left: 20px;"
              type="default"
              @click="onDrawerClose">关闭
            </a-button>
          </div>
        </a-card>
      </a-spin>
    </a-drawer>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { PersonSelect } from '@/module'
import { loadProjectManagerList, doSaveProjectProgressManager } from '@/api/projectProgressManager'
import moment from 'moment'
import store from '@/store'

export default {
  name: 'ProjectManager',
  components: {
    STable,
    PersonSelect
  },
  data () {
    return {
      moment,
      columns: [
        {
          dataIndex: 'rowIndex',
          title: '序号',
          width: 40,
          scopedSlots: { customRender: 'rowIndex' }
        }, {
          dataIndex: 'collectionDeptName',
          title: '回款业绩部门',
          width: 80,
          scopedSlots: { customRender: 'collectionDeptName' },
          ellipsis: true
        }, {
          dataIndex: 'contractNo',
          title: '合同号',
          width: 100
        }, {
          dataIndex: 'projectName',
          title: '项目名称',
          width: 250,
          scopedSlots: { customRender: 'projectName' },
          ellipsis: true
        }, {
          dataIndex: 'businessTypeName',
          title: '业务大类',
          width: 80
        }, {
          dataIndex: 'projectManagerName',
          title: '项目经理',
          width: 80,
          scopedSlots: { customRender: 'projectManagerName' }
        }, {
          dataIndex: 'reportFlag',
          title: '需上报进度',
          width: 70,
          scopedSlots: { customRender: 'reportFlag' },
          align: 'center'
        }, {
          dataIndex: 'progressManagerName',
          title: '进度经理',
          width: 80
        }, {
          dataIndex: 'operation',
          title: '操作',
          width: 40,
          scopedSlots: { customRender: 'operation' }
        }],
      cardHeight: 0,
      drawerCardHeight: window.innerHeight - 60,
      formHeight: window.innerHeight - 70,
      listScrollHeight: 0,
      rowSelected: '',
      rowSelectedInfo: '',
      drawerTitle: '',
      drawerVisible: false,
      projectManagerForm: {},
      projectManagerFormRules: {},
      readOnly: false,
      isSpinning: false,
      plainOptions: [
        { label: '未维护', value: 0 },
        { label: '已维护', value: 1 }
      ],
      pagination: { pageNumber: 1, pageSize: 25, totalCount: 1 },
      queryParam: { inputContent: '', maintainFlag: [0], pageSize: 25, progressManager: null },
      loadProjectList: parameter => {
        return loadProjectManagerList(Object.assign(parameter, this.queryParam)).then(res => {
          if (res.code === 200) {
            this.pagination.pageNumber = res.body.pageNumber + 1
            this.pagination.totalCount = res.body.totalCount
            return res.body
          }
        })
      }
    }
  },
  methods: {
    doQuery () {
      this.refreshProjectDataSource()
    },
    handleMaintainChange (val) {
      this.queryParam.maintainFlag = val
      this.doQuery()
    },
    handleProgressManagerChange (val) {
      this.queryParam.progressManager = val
      this.doQuery()
    },
    onReportFlagChange (val) {
      this.projectManagerForm.reportFlag = val ? 1 : 0
    },
    onProjectManagerChange (val, data) {
      this.projectManagerForm.projectManagerName = data.personName
    },
    onProgressManagerChange (val, data) {
      this.projectManagerForm.progressManagerName = data.personName
    },
    refreshProjectDataSource () {
      this.rowSelected = null
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    doOperate (record, op) {
      this.rowSelected = record.projectId
      this.rowSelectedInfo = { ...record }
      this.drawerTitle = '项目信息(' + record.projectName + ')'
      this.initFormFields()
      this.initFormValue(record)
      this.drawerVisible = true
    },
    initFormFields () {
      this.projectManagerForm = {
        projectId: null,
        projectName: null,
        contractNo: null,
        collectionDeptName: null,
        businessTypeName: null,
        projectManager: null,
        projectManagerName: null,
        progressManager: null,
        progressManagerName: null,
        registrant: null,
        registrantName: null,
        registrantDate: null,
        reportFlag: null
      }
    },
    initFormValue (record) {
      Object.assign(this.projectManagerForm, record)
      this.projectManagerForm.registrantDate = this.projectManagerForm.registrantDate ? moment(this.projectManagerForm.registrantDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
      this.projectManagerForm.registrantName = this.projectManagerForm.registrantName ? this.projectManagerForm.registrantName : store.getters.userInfo.personName
      this.projectManagerForm.reportFlag = this.projectManagerForm.maintainFlag === 0 ? 1 : this.projectManagerForm.reportFlag
      this.$nextTick(() => {
        this.$refs.projectManager.getCurrent(this.projectManagerForm.projectManager, this.projectManagerForm.projectManagerName)
        this.$refs.progressManager.getCurrent(this.projectManagerForm.progressManager, this.projectManagerForm.progressManagerName)
      })
    },
    onDrawerClose () {
      this.drawerVisible = false
      this.drawerTitle = ''
      this.initFormValue()
    },
    onSaveForm () {
      var param = {
        projectId: this.projectManagerForm.projectId,
        projectManager: this.projectManagerForm.projectManager,
        projectManagerName: this.projectManagerForm.projectManagerName,
        progressManager: this.projectManagerForm.progressManager,
        progressManagerName: this.projectManagerForm.progressManagerName,
        reportFlag: this.projectManagerForm.reportFlag
      }
      doSaveProjectProgressManager(param).then(res => {
        if (res.code === 200) {
          this.$message.success('保存成功！')
          this.rowSelected = null
          setTimeout(() => {
            this.$refs.table.refresh(false) // refresh() 不传参默认值 false 不刷新到分页第一页
          }, 100)
          this.onDrawerClose()
        }
      })
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.rowSelected = record.projectId
            this.rowSelectedInfo = { ...record }
          },
          dblclick: () => {
            this.rowSelected = record.projectId
            this.rowSelectedInfo = { ...record }
            this.doOperate(record, 'maintain')
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.projectId === this.rowSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    getWidthAndHeight () {
      this.listScrollHeight = window.innerHeight - 270
      this.cardHeight = window.innerHeight - 85
    }
  },
  created () {
    this.getWidthAndHeight()
  }
}
</script>

<style scoped>
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
    top: 36px;
    width: 100%
  }

  /deep/ .ant-calendar-picker-input.ant-input {
    line-height: 1.5;
    color: #000000;
    background: #ffffff;
  }

  /deep/ .ant-select-disabled .ant-select-selection {
    background: #ffffff;
    cursor: not-allowed;
  }
  .ant-input-affix-wrapper .ant-input:focus {
    border: none;
    box-shadow: none;
  }
</style>
