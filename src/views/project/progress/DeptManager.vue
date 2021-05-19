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
          :pressEnter="loadHead"
          :allowClear="true"
          v-model="queryParam.inputContent"
          placeholder="二级部门名称"
          style="width: 300px;"
          @search="loadHead"/>
        <a-divider type="vertical"/>
        <!--<a-checkbox-group :value="queryParam.logout" :options="plainOptions" @change="handleLogoutChange"/>
        <a-divider type="vertical"/>-->
        <a-button type="primary" icon="search" @click="loadHead">查询</a-button>
      </a-col>
    </a-row>
    <a-table
      v-watermark
      size="small"
      :bordered="true"
      :loading="loading"
      :rowKey="(record) => record.deptId"
      :columns="columns"
      :dataSource="deptList"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :pagination="false"
      :bodyStyle="{ minHeight: listScrollHeight+'px' }"
      :scroll="{ x: false, y: listScrollHeight }"
    >
      <template slot="deptName" slot-scope="text, record">
        <span :style="record.logout === 1 ? { color: 'red' } : ''">{{ text }}</span>
      </template>
      <template slot="logout" slot-scope="text">
        <a-badge v-if="text === 0" status="success" text="未注销"></a-badge>
        <a-badge v-if="text === 1" status="error" text="已注销"></a-badge>
      </template>
      <template slot="managerName" slot-scope="text">
        <a-tooltip>
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="operation" slot-scope="text, record">
        <a @click="doOperate(record, 'edit')">编辑</a>
      </template>
    </a-table>
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
            <a-form-model :model="managerForm" ref="managerForm" :rules="managerFormRules">
              <a-form-model-item
                label="一级区域"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="parentDeptName"
                style="margin-bottom: 10px;"
              >
                <a-input
                  v-model="managerForm.parentDeptName"
                  style="width: 400px;color: #000000"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="区域进度管理员"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="regionManagerName"
                style="margin-bottom: 10px;"
              >
                <a-input
                  v-model="managerForm.regionManagerName"
                  style="width: 400px;color: #000000"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="二级部门"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="deptName"
                style="margin-bottom: 10px;"
              >
                <a-input
                  v-model="managerForm.deptName"
                  style="width: 400px;color: #000000"
                  :readOnly="true"></a-input>
              </a-form-model-item>
              <a-form-model-item
                label="部门进度管理员"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="managerName"
                style="margin-bottom: 10px;"
              >
                <multipe-person-search-select
                  :record="managerForm"
                  customKey="manager"
                  customLabel="managerName"
                  style="width: 400px;color: #000000"
                  :disabled="readOnly"></multipe-person-search-select>
              </a-form-model-item>
              <a-form-model-item
                label="备注"
                :labelCol="{lg: {span: 5}, sm: {span: 2}}"
                :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
                prop="remark"
                style="margin-bottom: 10px;"
              >
                <a-textarea
                  v-model="managerForm.remark"
                  style="width: 400px;color: #000000"
                  :readOnly="readOnly"
                  :maxLength="160"
                  :auto-size="{ minRows: 2, maxRows: 2 }"/>
              </a-form-model-item>
            <!--<a-form-model-item
              label="注销"
              :labelCol="{lg: {span: 5}, sm: {span: 2}}"
              :wrapperCol="{lg: {span: 19}, sm: {span: 20} }"
              prop="logout"
              style="margin-bottom: 10px;"
            >
              <a-switch :checked="managerForm.logout === 1" @change="onLogoutChange"/>
            </a-form-model-item>-->
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
            <a-button type="primary" @click="doSave" style="margin-left: 20px">保存</a-button>
            <a-button key="back" @click="onDrawerClose" style="margin-left: 20px">关闭</a-button>
          </div>
        </a-card>
      </a-spin>
    </a-drawer>
  </a-card>
</template>

<script>
import { loadDeptManagerList, doLoadDeptManagerHead, doSaveDeptProgressManager } from '@/api/deptProgressManager'
import { MultipePersonSearchSelect } from '@/module'

export default {
  name: 'DeptManager',
  components: {
    MultipePersonSearchSelect
  },
  data () {
    return {
      columns: [],
      cardHeight: 0,
      drawerCardHeight: window.innerHeight - 60,
      formHeight: window.innerHeight - 70,
      listScrollHeight: 0,
      rowSelected: '',
      drawerTitle: '',
      drawerVisible: false,
      managerForm: {},
      managerFormRules: {},
      readOnly: false,
      loading: false,
      isSpinning: false,
      plainOptions: [
        { label: '未注销', value: 0 },
        { label: '已注销', value: 1 }
      ],
      queryParam: { inputContent: '', logout: [0] },
      deptList: []
    }
  },
  methods: {
    loadHead () {
      doLoadDeptManagerHead({ logout: this.queryParam.logout, inputContent: this.queryParam.inputContent }).then(res => {
        if (res.code === 200) {
          this.deptList = []
          this.initHead(res.body)
        }
      }).then(() => {
        this.doQuery()
      })
    },
    doQuery () {
      this.rowSelected = ''
      this.doQueryDept()
    },
    handleLogoutChange (val) {
      this.queryParam.logout = val
      this.loadHead()
    },
    doOperate (record, op) {
      this.rowSelected = record.deptId
      this.drawerTitle = record.deptName
      this.drawerVisible = true
      this.initFormFields()
      this.initFormValue(record)
    },
    doSave () {
      var form = {}
      this.isSpinning = true
      doSaveDeptProgressManager(Object.assign(form, this.managerForm)).then((res) => {
        if (res.code === 200) {
          this.$message.success('保存成功')
          this.loadHead()
          this.onDrawerClose()
        }
        this.isSpinning = false
      })
    },
    doQueryDept () {
      this.loading = true
      var parameter = {}
      loadDeptManagerList(Object.assign(parameter, this.queryParam)).then((res) => {
        if (res.code === 200) {
          this.deptList = res.body
          this.loading = false
        }
        this.loading = false
      })
    },
    onLogoutChange (checked) {
      if (this.readOnly) {
        return
      }
      this.managerForm.logout = checked ? 1 : 0
    },
    initHead (columns) {
      const header = []
      columns.forEach(h => {
        const column = {
          title: h.title,
          dataIndex: h.column,
          ellipsis: h.ellipsis,
          scopedSlots: h.scopedSlots,
          align: h.align
        }
        if (h.colSpan) {
          column.colSpan = h.colSpan
        }
        if (h.width) {
          column.width = h.width
        }
        if (h.rowSpan) {
          column.customRender = (value, row, index) => {
            const obj = {
              children: value,
              attrs: {}
            }
            let sum = 0
            for (let j = 0; j < h.rowSpan.length; j++) {
              const count = h.rowSpan[j]
              for (let k = 0; k < count; k++) {
                if (index === sum) {
                  obj.attrs.rowSpan = count
                } else if (index === (sum + k)) {
                  obj.attrs.rowSpan = 0
                }
              }
              sum += count
            }

            return obj
          }
        }
        header.push(column)
      })
      this.columns = [...header]
    },
    initFormFields () {
      this.managerForm = {
        parentDeptName: null,
        regionManagerName: null,
        deptName: null,
        managerName: null,
        remark: null,
        logout: null
      }
    },
    initFormValue (record) {
      Object.assign(this.managerForm, record)
    },
    onDrawerClose () {
      this.drawerVisible = false
      this.drawerTitle = ''
      this.initFormValue()
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.rowSelected = record.deptId
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.deptId === this.rowSelected) {
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
    this.loadHead()
  }
}
</script>

<style scoped>
  /deep/ .ant-table-row:last-child td {
    border-bottom: 1px solid #e8e8e8 !important;
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
    top: 36px;
    width: 100%
  }

  /deep/ .ant-select-disabled .ant-select-selection {
    background: #ffffff;
    cursor: not-allowed;
  }

  /deep/ .ant-select-disabled .ant-select-selection--multiple .ant-select-selection__choice {
    padding-right: 10px;
    color: #000000;
    background: #ffffff;
  }
</style>
