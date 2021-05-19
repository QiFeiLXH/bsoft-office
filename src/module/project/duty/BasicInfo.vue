<template>
  <a-spin size="large" :spinning="spinning">
    <a-card :bordered="false" :body-style="{ height:cardHeight + 'px',padding:'0px 0px 0px 10px'}">
      <div :style="{ height: formHeight + 'px',paddingBottom: '50px', overflowY: 'auto' }">
        <a-form-model :model="basicInfoForm" hideRequiredMark ref="basicInfoForm" :rules="basicInfoFormRules">
          <a-card :body-style="{ padding: '10px 0 10px 10px' }">
            <span style="fontWeight: bold">1.责任书范围</span>
            <a-form-model-item
              label="客户名称"
              :labelCol="{lg: {span: 3}, sm: {span: 2}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
              prop="customerName"
              style="margin-bottom: 0px;"
            >
              <a-input v-model="basicInfoForm.customerName" style="width: 688.2px;color: #000000" :readOnly="true"/>
              <a-icon
                v-if="!readOnly"
                type="search"
                @click="doCustomerSearch"
                style="margin-left: 10px;font-size: 15px"/>
              <a-modal
                title="客户名称选择"
                style="top: 30px;"
                v-model="customerModalVisible"
                :width="700"
                :maskClosable="false"
                :bodyStyle="{ height: customerModalHeight }"
                :closable="false"
                :destroyOnClose="true">
                <a-table
                  size="small"
                  :bordered="false"
                  :loading="isCustomerLoading"
                  :columns="customerColumns"
                  :dataSource="customerList"
                  :rowKey="(record) => record.contractNo"
                  :pagination="false"
                  :customRow="onCustomerClickRow"
                  :rowClassName="setCustomerCurrentRow"
                  :scroll="{ x: false, y: listProjectScrollHeight }">
                  <template slot="rowIndex" slot-scope="text, record, index">
                    <span>
                      {{ (customerCurrentPage - 1) * customerModalPage.pageSize + index + 1 }}
                    </span>
                  </template>
                </a-table>
                <template slot="footer">
                  <a-pagination
                    size="small"
                    :total="customerModalPage.totalCount"
                    :pageSize.sync="customerModalPage.pageSize"
                    v-model="customerModalPage.pageNumber"
                    @change="onCustomerModalCurrentChange"
                    style="margin-bottom: 10px"/>
                  <a-button key="submit" type="primary" @click="onCustomerModalConfirm">确定</a-button>
                  <a-button key="back" @click="onCustomerModalCancel">取消</a-button>
                </template>
              </a-modal>
            </a-form-model-item>
            <a-form-model-item
              label="考核周期"
              :labelCol="{lg: {span: 3}, sm: {span: 2}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
              :required="false"
              prop="assessmentCycle"
              style="margin-bottom: 0px;"
            >
              <a-range-picker
                :disabled="readOnly"
                :format="dateFormat"
                v-model="basicInfoForm.assessmentCycle"
                :disabledDate="disabledDate"
                @calendarChange="calendarChange"
                @change="changeAssessmentCycle"
              />
            </a-form-model-item>
            <a-form-model-item
              label="责任书名称"
              :labelCol="{lg: {span: 3}, sm: {span: 2}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
              :required="false"
              prop="name"
              style="margin-bottom: 0px;"
            >
              <a-input v-model="dutyName" :readOnly="true" style="width: 688.2px;color: #000000"/>
            </a-form-model-item>
            <a-form-model-item
              label="项目范围"
              :labelCol="{lg: {span: 3}, sm: {span: 2}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
              :required="false"
              prop="region"
              style="margin-bottom: 0px;"
            >
              <a-form-model-item :style="{ display: 'inline-block',marginBottom: '0px',width: '85%' }">
                <a-table
                  size="small"
                  :bordered="false"
                  :loading="isProjectRegionLoading"
                  :columns="projectRegionColumns"
                  :dataSource="projectRegionList"
                  :rowKey="(record) => record.contractNo"
                  :pagination="false"
                  :customRow="onProjectRegionClickRow"
                  :rowClassName="setProjectRegionCurrentRow"
                  :scroll="{ x: false, y: listProjectRegionScrollHeight }"
                  :style="{background: 'white', margin: '0 0'}">
                  <template slot="rowIndex" slot-scope="text, record, index">
                    <span>
                      {{ index + 1 }}
                    </span>
                  </template>
                  <template slot="weight" slot-scope="text, record">
                    <template v-if="readOnly">
                      <span>{{ text | PercentFormat }}</span>
                    </template>
                    <template v-else>
                      <a-select
                        :value="text | PercentFormat"
                        show-search
                        option-filter-prop="children"
                        style="width: 100px;color: #000000"
                        :class="record.error?'errorClass':''"
                        :filter-option="filterOption"
                        @focus="handleWeightFocus(record)"
                        @change="handleWeightChange">
                        <a-select-option v-for="i in 20" :key="0.05 * i">
                          {{ 0.05 * i | PercentFormat }}
                        </a-select-option>
                      </a-select>
                    </template>
                  </template>
                  <template slot="footer" v-if="projectRegionList.length > 0">
                    <div style="text-align: right;margin-right: 20px">合计：<span :style="error?{color: 'red'}:{}">{{ totalWeight | PercentFormat }}</span></div>
                  </template>
                </a-table>
              </a-form-model-item>
              <a-form-model-item :style="{ display: 'inline-block',marginBottom: '0px', marginLeft: '5px' }">
                <a-button
                  type="primary"
                  icon="search"
                  @click="doSearch"
                  :disabled="!basicInfoForm.customerName"
                  v-if="!readOnly">选择
                </a-button>
                <a-modal
                  title="项目范围选择"
                  style="top: 30px;"
                  v-model="projectModalVisible"
                  :width="700"
                  :maskClosable="false"
                  :bodyStyle="{height: modalHeight}"
                  :closable="false"
                  :destroyOnClose="true">
                  <a-table
                    size="small"
                    :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                    :bordered="false"
                    :loading="isProjectLoading"
                    :columns="projectColumns"
                    :dataSource="projectList"
                    :rowKey="(record) => record.contractNo"
                    :pagination="false"
                    :customRow="onProjectClickRow"
                    :rowClassName="setProjectCurrentRow"
                    :scroll="{ x: false, y: listProjectScrollHeight }">
                    <template slot="rowIndex" slot-scope="text, record, index">
                      <span>
                        {{ (projectCurrentPage - 1) * projectModalPage.pageSize + index + 1 }}
                      </span>
                    </template>
                  </a-table>
                  <template slot="footer">
                    <a-pagination
                      size="small"
                      :total="projectModalPage.totalCount"
                      :pageSize.sync="projectModalPage.pageSize"
                      v-model="projectModalPage.pageNumber"
                      @change="onProjectModalCurrentChange"
                      style="margin-bottom: 10px"/>
                    <a-button key="submit" type="primary" @click="onProjectModalConfirm">确定</a-button>
                    <a-button key="back" @click="onProjectModalCancel">取消</a-button>
                  </template>
                </a-modal>
              </a-form-model-item>
            </a-form-model-item>
          </a-card>
          <a-card :body-style="{ padding: '10px 0 10px 10px' }">
            <span style="fontWeight: bold">2.预算总成本:</span>
            <span> {{ Number(totalCost).toFixed(2) }} 万元</span><br/>
            <a-row>
              <a-col :span="8">
                <a-form-model-item
                  label="人力成本(1.8)"
                  prop="laborCost"
                  :labelCol="{lg: {span: 10}, sm: {span: 2}}"
                  :wrapperCol="{lg: {span: 14}, sm: {span: 20} }"
                  :required="false"
                  :style="{ marginBottom: '0px' }"
                >
                  <a-input
                    v-model="basicInfoForm.laborCost"
                    style="width: 58%;color: #000000"
                    :readOnly="readOnly"
                    v-if="readOnly"/>
                  <a-input-number
                    @blur="calculateTotalCost"
                    @change="changeLaborCost"
                    :precision="2"
                    v-model="basicInfoForm.laborCost"
                    style="width: 58%;color: #000000"
                    v-else/>
                  万元
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="报销费用"
                  prop="reimburse"
                  :labelCol="{lg: {span: 10}, sm: {span: 2}}"
                  :wrapperCol="{lg: {span: 14}, sm: {span: 20} }"
                  :required="false"
                  :style="{ marginBottom: '0px' }"
                >
                  <a-input
                    v-model="basicInfoForm.reimburse"
                    style="width: 58%;color: #000000"
                    :readOnly="readOnly"
                    v-if="readOnly"/>
                  <a-input-number
                    @blur="calculateTotalCost"
                    @change="changeReimburse"
                    :precision="2"
                    v-model="basicInfoForm.reimburse"
                    style="width: 58%;color: #000000"
                    v-else/>
                  万元
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="责任书奖金"
                  prop="bonus"
                  :labelCol="{lg: {span: 10}, sm: {span: 2}}"
                  :wrapperCol="{lg: {span: 14}, sm: {span: 20} }"
                  :required="false"
                  :style="{ marginBottom: '0px' }"
                >
                  <a-input
                    v-model="basicInfoForm.bonus"
                    style="width: 58%;color: #000000"
                    :readOnly="readOnly"
                    v-if="readOnly"/>
                  <a-input-number
                    @blur="calculateTotalCost"
                    @change="changeBonus"
                    :precision="2"
                    v-model="basicInfoForm.bonus"
                    style="width: 58%;color: #000000"
                    v-else/>
                  万元
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-card>
          <a-card :body-style="{ padding: '10px 0 10px 10px' }">
            <span style="fontWeight: bold">3.计划回款:</span>
            <span
              v-if="basicInfoForm.expectedBackMoney"
              style="color: #000000">{{ Number(basicInfoForm.expectedBackMoney).toFixed(2) }} 万元</span>
          </a-card>
        </a-form-model>
      </div>
      <a-alert
        closable
        v-if="isErrorAlert"
        @close="onAlertClose"
        :type="alertType"
        style="position: absolute;bottom: 60px;margin-left:370px;width: 500px;text-align: left"
        showIcon
        :message="alertMessage"/>
    </a-card>
  </a-spin>
</template>

<script>
import {
  loadProjectSelectList,
  loadProjectDutyInfo,
  loadCustomerSelectList,
  loadProjectRegionList,
  loadProjectDutyNameNoQuery,
  doSaveProjectDuty
} from '@/api/projectDutyMaintain'
import moment from 'moment/moment'
import { Decimal } from 'decimal.js'

const projectRegionColumns = [{
  dataIndex: 'rowIndex',
  title: '序号',
  width: '10%',
  scopedSlots: { customRender: 'rowIndex' },
  align: 'center'
},
{
  dataIndex: 'contractCode',
  width: '20%',
  title: '合同编号'
},
{
  dataIndex: 'contractName',
  width: '50%',
  title: '合同名称'
},
{
  dataIndex: 'weight',
  width: '20%',
  title: '权重',
  scopedSlots: { customRender: 'weight' },
  align: 'center'
}]

const projectColumns = [{
  dataIndex: 'rowIndex',
  title: '序号',
  width: '10%',
  scopedSlots: { customRender: 'rowIndex' },
  align: 'center'
},
{
  dataIndex: 'contractCode',
  width: '20%',
  title: '合同编号'
},
{
  dataIndex: 'contractName',
  width: '45%',
  title: '合同名称'
},
{
  dataIndex: 'areaText',
  width: '25%',
  title: '工程区域'
}]
const customerColumns = [{
  dataIndex: 'rowIndex',
  title: '',
  width: '7%',
  scopedSlots: { customRender: 'rowIndex' },
  align: 'center'
},
{
  dataIndex: 'contractCode',
  width: '18%',
  title: '合同编号'
},
{
  dataIndex: 'customerName',
  width: '50%',
  title: '客户名称'
},
{
  dataIndex: 'areaText',
  width: '25%',
  title: '工程区域'
}]
export default {
  name: 'BasicInfo',
  data () {
    // 日期校验
    var validateDate = (rule, value, callback) => {
      if (value.length < 2) {
        callback(new Error('请输入考核周期！'))
      } else {
        callback()
      }
    }
    var validateBonus = (rule, value, callback) => {
      if (this.needValidate && !value) {
        callback(new Error('请填写责任书奖金！'))
      } else {
        callback()
      }
    }
    var validateReimburse = (rule, value, callback) => {
      if (this.needValidate && !value) {
        callback(new Error('请填写报销费用！'))
      } else {
        callback()
      }
    }
    var validateLaborCost = (rule, value, callback) => {
      if (this.needValidate && !value) {
        callback(new Error('请填写人力成本！'))
      } else {
        callback()
      }
    }
    return {
      moment,
      rowSelected: '',
      rowProjectSelected: '',
      rowCustomerSelected: '',
      rowCustomerSelectedInfo: {},
      listProjectRegionScrollHeight: 310,
      cardHeight: window.innerHeight - 60,
      formHeight: window.innerHeight - 110,
      projectRegionCardHeight: 420,
      projectRegionTableHeight: 200,
      listProjectScrollHeight: 320,
      customerModalHeight: 400 + 'px',
      modalHeight: 400 + 'px',
      isCustomerLoading: false,
      isProjectRegionLoading: false,
      isProjectLoading: false,
      projectRegionColumns,
      projectColumns,
      customerColumns,
      projectList: [],
      basicInfoForm: {
        id: null,
        customerId: null,
        customerName: null,
        startDate: moment().startOf('year'),
        endDate: moment().endOf('year'),
        name: null,
        laborCost: null,
        reimburse: null,
        bonus: null,
        backMoney: null,
        expectedBackMoney: null,
        budgetTotalCost: null,
        assessmentCycle: [moment().startOf('year'), moment().endOf('year')]
      },
      customerModalVisible: false,
      projectModalVisible: false,
      projectModalPage: { pageNumber: 0, pageSize: 0, totalCount: 0 },
      customerModalPage: { pageNumber: 0, pageSize: 0, totalCount: 0 },
      currentProjectDutyId: null,
      customerModalQueryParam: { pageNo: 1, pageSize: 25 },
      projectModalQueryParam: { pageNo: 1, pageSize: 25, customerId: null },
      customerCurrentPage: 1,
      projectCurrentPage: 1,
      customerList: [],
      selectedCustomer: undefined,
      readOnly: false,
      selectedProjects: [],
      selectedRowKeys: [],
      projectDuty: {},
      projectRegionList: [],
      originalProjectRegionList: [],
      spinning: false,
      totalCost: 0,
      basicInfoFormRules: {
        customerName: [{ required: true, message: '请选择客户名称！', trigger: 'blur' }],
        assessmentCycle: [{ validator: validateDate, trigger: 'blur' }],
        bonus: [{ validator: validateBonus, trigger: 'blur' }],
        reimburse: [{ validator: validateReimburse, trigger: 'blur' }],
        laborCost: [{ validator: validateLaborCost, trigger: 'blur' }]
      },
      basicInfo: {},
      error: false,
      dateFormat: 'YYYY/MM/DD',
      needValidate: false,
      isErrorAlert: false,
      alertType: 'warning',
      alertMessage: ''
    }
  },
  props: {
    operate: {
      type: String,
      default: 'read',
      required: true
    },
    dutyId: {
      type: Number,
      default: 0
    },
    infoTabPane: {
      type: Object,
      default: null
    },
    dutyInfo: {
      type: Object,
      default: null
    },
    btnStatus: {
      type: Object,
      default: null
    },
    alertData: {
      type: Object,
      default: null
    }
  },
  methods: {
    handleWeightFocus (record) {
      this.rowSelected = record.contractNo
    },
    handleWeightChange (val) {
      this.isErrorAlert = false
      const newData = [...this.projectRegionList]
      const target = newData.find(item => this.rowSelected === item.contractNo)
      if (target) {
        target['weight'] = val
        this.projectRegionList = newData
      }
      this.infoTabPane.hasChanged = true
    },
    onCustomerModalCurrentChange (pageNo) {
      this.customerModalQueryParam.pageNo = pageNo
      this.doCustomerSearch()
    },
    onProjectModalCurrentChange (pageNo) {
      this.isErrorAlert = false
      this.projectModalQueryParam.pageNo = pageNo
      this.loadProjectList()
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    doCustomerSearch () {
      this.isErrorAlert = false
      this.rowCustomerSelected = ''
      this.rowCustomerSelectedInfo = {}
      this.customerModalVisible = true
      this.customerList = []
      this.loadCustomerList()
    },
    doSearch () {
      this.isErrorAlert = false
      this.rowProjectSelected = ''
      this.projectModalVisible = true
      this.projectList = []
      this.selectedRowKeys = []
      this.selectedProjects = []
      this.loadProjectList()
    },
    calendarChange (dates) {
      this.isErrorAlert = false
      if (dates.length === 1) {
        this.basicInfoForm.assessmentCycle[0] = dates[0]
      }
    },
    changeAssessmentCycle (dates) {
      this.isErrorAlert = false
      this.basicInfoForm.startDate = dates[0]
      this.basicInfoForm.endDate = dates[1]
      this.basicInfoForm.assessmentCycle = dates
      this.infoTabPane.hasChanged = true
    },
    disabledDate (current) {
      const startDate = this.basicInfoForm.assessmentCycle[0]
      if (startDate) {
        return startDate.format('YYYY') !== current.format('YYYY')
      }
    },
    calculateTotalCost () {
      this.totalCost = 0
      if (this.basicInfoForm.laborCost > 0) {
        this.totalCost = new Decimal(this.totalCost).add(new Decimal(this.basicInfoForm.laborCost)).toNumber()
      }
      if (this.basicInfoForm.reimburse > 0) {
        this.totalCost = new Decimal(this.totalCost).add(new Decimal(this.basicInfoForm.reimburse)).toNumber()
      }
      if (this.basicInfoForm.bonus > 0) {
        this.totalCost = new Decimal(this.totalCost).add(new Decimal(this.basicInfoForm.bonus)).toNumber()
      }
    },
    changeLaborCost (val) {
      this.isErrorAlert = false
      this.basicInfoForm.laborCost = val
      this.infoTabPane.hasChanged = true
    },
    changeBonus (val) {
      this.isErrorAlert = false
      this.basicInfoForm.bonus = val
      this.infoTabPane.hasChanged = true
    },
    changeReimburse (val) {
      this.isErrorAlert = false
      this.basicInfoForm.reimburse = val
      this.infoTabPane.hasChanged = true
    },
    doGenerateName (flag) {
      if (flag) { // 若有一值为空则返回
        return
      }
      if (this.operate === 'modify') {
        if (this.basicInfo.customerId === this.basicInfoForm.customerId) {
          this.basicInfoForm.name = this.basicInfo.name
          return
        }
      }
      var year = this.basicInfoForm.startDate.format('YYYY').toString()
      const params = { year: year, customerId: this.basicInfoForm.customerId }
      loadProjectDutyNameNoQuery(params)
        .then(res => {
          if (res.code === 200) {
            var projectDutyNameNo = ''
            if (res.body) {
              projectDutyNameNo = Number(res.body.split('-')[2]) + 1 // 截取最新项目责任书名称中的序号并加1
            } else {
              projectDutyNameNo = 1
            }
            this.basicInfoForm.name = 'ZRS-' + year + '-' + projectDutyNameNo + '-' + this.basicInfoForm.customerName
          }
        })
    },
    calculateTotalWeight () {
      var totalWeight = 0
      const newData = [...this.projectRegionList]
      if (this.projectRegionList.length > 0) {
        this.projectRegionList.forEach(item => {
          if (item.weight) {
            totalWeight = new Decimal(totalWeight).add(new Decimal(item.weight)).toNumber()
          }
        })
      }
      if (totalWeight.toFixed(2) > 1) {
        newData.forEach(item => {
          item.error = true
        })
        if (!this.error) {
          this.$message.error('权重已超100%！')
        }
        this.error = true
      } else {
        newData.forEach(item => {
          item.error = false
        })
        this.error = false
      }
      return totalWeight
    },
    loadCustomerList () {
      this.isCustomerLoading = true
      loadCustomerSelectList(this.customerModalQueryParam)
        .then(res => {
          if (res.code === 200) {
            this.customerModalPage.pageNumber = res.body.pageNumber + 1
            this.customerModalPage.pageSize = res.body.pageSize
            this.customerModalPage.totalCount = res.body.totalCount
            this.customerList = res.body.items
            this.customerCurrentPage = res.body.pageNumber + 1
          }
          this.isCustomerLoading = false
        })
    },
    loadProjectList () {
      this.isProjectLoading = true
      loadProjectSelectList(this.projectModalQueryParam)
        .then(res => {
          if (res.code === 200) {
            this.projectModalPage.pageNumber = res.body.pageNumber + 1
            this.projectModalPage.pageSize = res.body.pageSize
            this.projectModalPage.totalCount = res.body.totalCount
            this.projectList = res.body.items
            this.projectCurrentPage = res.body.pageNumber + 1
            this.projectRegionList.forEach(item => {
              if (item && this.projectList.find(project => project.contractNo === item.contractNo)) {
                this.selectedRowKeys.push(item.contractNo)
                this.selectedProjects.push(this.projectList.find(project => project.contractNo === item.contractNo))
              }
            })
          }
          this.isProjectLoading = false
        })
    },
    loadProjectRegionList () {
      this.isProjectRegionLoading = true
      loadProjectRegionList({ dutyId: this.currentProjectDutyId })
        .then(res => {
          if (res.code === 200) {
            this.projectRegionList = [...res.body]
            this.originalProjectRegionList = [...this.projectRegionList]
          }
          this.isProjectRegionLoading = false
        })
    },
    onProjectRegionClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.isErrorAlert = false
            this.rowSelected = record.contractNo
          }
        }
      }
    },
    setProjectRegionCurrentRow (record, index) {
      var styleClassName = ''
      if (record.contractNo === this.rowSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    onProjectClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.isErrorAlert = false
            this.rowProjectSelected = record.contractNo
            if (this.selectedRowKeys.includes(record.contractNo)) {
              this.selectedRowKeys = this.selectedRowKeys.filter(contractNo => contractNo !== record.contractNo)
              this.selectedProjects = this.selectedProjects.filter(item => item.contractNo !== record.contractNo)
            } else {
              this.selectedRowKeys.push(record.contractNo)
              this.selectedProjects.push(record)
            }
            this.infoTabPane.hasChanged = true
          }
        }
      }
    },
    setProjectCurrentRow (record, index) {
      var styleClassName = ''
      if (record.contractNo === this.rowProjectSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    onCustomerClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.isErrorAlert = false
            this.rowCustomerSelected = record.contractNo
            this.rowCustomerSelectedInfo = record
          },
          dblclick: () => {
            this.isErrorAlert = false
            this.basicInfoForm.customerId = record.customerId
            this.basicInfoForm.customerName = record.customerName
            this.projectModalQueryParam.customerId = record.customerId
            this.customerModalVisible = false
            this.rowCustomerSelected = ''
            this.rowCustomerSelectedInfo = {}
            this.infoTabPane.hasChanged = true
            var validateField = ['customerName']
            this.$refs.basicInfoForm.validateField(validateField, errorMessage => {
            })
          }
        }
      }
    },
    setCustomerCurrentRow (record, index) {
      var styleClassName = ''
      if (record.contractNo === this.rowCustomerSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.isErrorAlert = false
      this.selectedRowKeys = selectedRowKeys
      this.selectedProjects = selectedRows
      this.infoTabPane.hasChanged = true
    },
    onProjectModalConfirm () {
      this.isErrorAlert = false
      this.projectRegionList = this.selectedProjects
      if (this.projectRegionList.length === 1) {
        this.projectRegionList.forEach(item => {
          item.weight = 1
        })
      }
      this.projectModalVisible = false
      this.infoTabPane.hasChanged = true
    },
    onProjectModalCancel () {
      this.isErrorAlert = false
      this.projectModalVisible = false
    },
    onCustomerModalConfirm () {
      this.isErrorAlert = false
      this.basicInfoForm.customerId = this.rowCustomerSelectedInfo.customerId
      this.basicInfoForm.customerName = this.rowCustomerSelectedInfo.customerName
      this.projectModalQueryParam.customerId = this.rowCustomerSelectedInfo.customerId
      this.customerModalVisible = false
      this.infoTabPane.hasChanged = true
      var validateField = ['customerName']
      this.$refs.basicInfoForm.validateField(validateField, errorMessage => {
      })
    },
    onCustomerModalCancel () {
      this.isErrorAlert = false
      this.customerModalVisible = false
    },
    onAlertClose () {
      this.isErrorAlert = false
      this.alertMessage = ''
    },
    handleSaveProjectDuty () {
      this.isErrorAlert = false
      if (this.error) {
        return
      }
      var validateResult = true
      var msg = ''
      // 保存校验
      this.needValidate = false
      msg = '保存成功！'
      this.basicInfoForm.committed = 0
      var validateField = ['customerName', 'assessmentCycle']
      this.$refs.basicInfoForm.validateField(validateField, errorMessage => {
        if (errorMessage) {
          validateResult = false
        }
      })
      var clearValidateField = ['laborCost', 'bonus', 'reimburse']
      this.$refs.basicInfoForm.clearValidate(clearValidateField)
      // 提交校验
      if (!validateResult) {
        this.btnStatus.savebtnStatus = false
        return
      }
      // 判断项目范围的权重是否有值
      var deleteRegions = []
      var contractNo = []
      if (this.projectRegionList.length > 0) {
        for (var i = 0; i < this.projectRegionList.length; i++) {
          if (!this.projectRegionList[i].weight) {
            this.alertType = 'error'
            this.alertMessage = '项目范围权重不能为空，请选择权重大小!'
            this.isErrorAlert = true
            this.btnStatus.savebtnStatus = false
            return
          }
        }
      }
      // 筛选出删除的项目范围
      this.originalProjectRegionList.forEach(item1 => {
        var target = this.projectRegionList.find(item2 => item2.contractNo === item1.contractNo)
        if (!target) { // 不存在表示删除了该项目范围
          deleteRegions.push(item1.id)
          contractNo.push(item1.contractNo)
        } else {
          Object.keys(item1).forEach(key => {
            if (key !== 'weight') {
              target[key] = item1[key]
            }
          })
        }
      })
      const saveRegions = [...this.projectRegionList]
      this.basicInfoForm.startDate = this.basicInfoForm.assessmentCycle[0]
      this.basicInfoForm.endDate = this.basicInfoForm.assessmentCycle[1]
      this.projectDuty = { ...this.basicInfoForm }
      this.projectDuty.startDate = this.basicInfoForm.startDate.format('YYYY-MM-DD')
      this.projectDuty.endDate = this.basicInfoForm.endDate.format('YYYY-MM-DD')

      if (this.projectDuty.laborCost) {
        this.projectDuty.laborCost = this.projectDuty.laborCost * 10000
      }
      if (this.projectDuty.reimburse) {
        this.projectDuty.reimburse = this.projectDuty.reimburse * 10000
      }
      if (this.projectDuty.bonus) {
        this.projectDuty.bonus = this.projectDuty.bonus * 10000
      }
      const params = { duty: this.projectDuty, saveRegions: saveRegions, deleteRegions: deleteRegions, contractNo: contractNo }
      doSaveProjectDuty(params)
        .then(res => {
          if (res.code === 200) {
            this.currentProjectDutyId = res.body
            this.spinning = false
            this.$message.success(msg)
            var data = { key: '1', isAlert: false }
            this.$emit('resetActiveKey', data)
            this.$emit('refresh', this.currentProjectDutyId, 'modify')
            this.loadProjectDutyInfo()
            this.infoTabPane.hasChanged = false
          }
          this.btnStatus.savebtnStatus = false
          this.spinning = false
        })
    },
    handleCommitProjectDuty (regions) {
      this.isErrorAlert = false
      if (this.error) {
        return
      }
      if (regions) {
        this.projectRegionList = regions
      }
      var validateResult = true
      var msg = ''
      // 提交校验
      this.needValidate = true
      msg = '提交成功！'
      this.basicInfoForm.committed = 1
      this.$refs.basicInfoForm.validate(valid => {
        if (valid) {
        } else {
          validateResult = false
        }
      })
      if (!validateResult) {
        this.$emit('resetActiveKey', { key: '1' })
        this.btnStatus.commitbtnStatus = false
        return
      }
      if (this.projectRegionList.length === 0) {
        this.alertType = 'warning'
        this.alertMessage = '请选择项目范围!'
        this.isErrorAlert = true
        this.$emit('resetActiveKey', { key: '1' })
        this.btnStatus.commitbtnStatus = false
        return
      }
      // 判断项目范围的权重是否为1
      var totalWeight = null
      if (this.projectRegionList.length > 0) {
        this.projectRegionList.forEach(item => {
          totalWeight += item.weight
        })
        if (Number(totalWeight.toFixed(2)) !== 1) {
          this.alertType = 'warning'
          this.alertMessage = '项目范围权重之和不为100%！'
          this.isErrorAlert = true
          this.$emit('resetActiveKey', { key: '1' })
          this.btnStatus.commitbtnStatus = false
          return
        }
      }
      for (var i = 0; i < this.projectRegionList.length; i++) {
        if (!this.projectRegionList[i].weight) {
          this.alertType = 'error'
          this.alertMessage = '项目范围权重不能为空，请选择权重大小!'
          this.isErrorAlert = true
          this.$emit('resetActiveKey', { key: '1' })
          this.btnStatus.commitbtnStatus = false
          return
        }
        if (!this.projectRegionList[i].id) {
          this.alertType = 'warning'
          this.alertMessage = '请先保存项目范围!'
          this.isErrorAlert = true
          this.$emit('resetActiveKey', { key: '1' })
          this.btnStatus.commitbtnStatus = false
          return
        }
        if (!this.projectRegionList[i].mileposts || this.projectRegionList[i].mileposts.length === 0) {
          this.$emit('resetActiveKey', { key: '2' })
          this.alertData.alertMsg = '请在里程碑设置中设置并保存每个合同相对应的里程碑!'
          this.alertData.alertType = 'warning'
          this.alertData.isAlert = true
          this.btnStatus.commitbtnStatus = false
          return
        } else {
          var milepost = [...this.projectRegionList[i].mileposts]
          for (var j = 0; j < milepost.length; j++) {
            if (!milepost[j].name) {
              this.$emit('resetActiveKey', { key: '2' })
              this.alertData.alertMsg = '合同号：' + this.projectRegionList[i].contractCode + '-请确保设置里程碑名字!'
              this.alertData.alertType = 'error'
              this.alertData.isAlert = true
              this.btnStatus.commitbtnStatus = false
              return false
            }
            if (!milepost[j].words) {
              this.$emit('resetActiveKey', { key: '2' })
              this.alertData.alertMsg = '合同号：' + this.projectRegionList[i].contractCode + '-请先设置文档要求!'
              this.alertData.alertType = 'error'
              this.alertData.isAlert = true
              this.btnStatus.commitbtnStatus = false
              return false
            }
            if (!milepost[j].weight) {
              this.$emit('resetActiveKey', { key: '2' })
              this.alertData.alertMsg = '合同号：' + this.projectRegionList[i].contractCode + '-请先设置权重!'
              this.alertData.alertType = 'error'
              this.alertData.isAlert = true
              this.btnStatus.commitbtnStatus = false
              return false
            }
            if (this.totalWeight < 1) {
              this.$emit('resetActiveKey', { key: '2' })
              this.alertData.alertMsg = '合同号：' + this.projectRegionList[i].contractCode + '-权重之和不为100%，请重新设置!'
              this.alertData.alertType = 'error'
              this.alertData.isAlert = true
              this.btnStatus.commitbtnStatus = false
              return false
            }
          }
        }
      }
      // 筛选出删除的项目范围
      var deleteRegions = []
      this.originalProjectRegionList.forEach(item1 => {
        var target = this.projectRegionList.find(item2 => item2.contractNo === item1.contractNo)
        if (!target) { // 不存在表示删除了该项目范围
          deleteRegions.push(item1.id)
        } else {
          Object.keys(item1).forEach(key => {
            if (key !== 'weight') {
              target[key] = item1[key]
            }
          })
        }
      })
      const saveRegions = [...this.projectRegionList]
      this.basicInfoForm.startDate = this.basicInfoForm.assessmentCycle[0]
      this.basicInfoForm.endDate = this.basicInfoForm.assessmentCycle[1]
      this.projectDuty = { ...this.basicInfoForm }
      this.projectDuty.startDate = this.basicInfoForm.startDate.format('YYYY-MM-DD')
      this.projectDuty.endDate = this.basicInfoForm.endDate.format('YYYY-MM-DD')

      if (this.projectDuty.laborCost) {
        this.projectDuty.laborCost = this.projectDuty.laborCost * 10000
      }
      if (this.projectDuty.reimburse) {
        this.projectDuty.reimburse = this.projectDuty.reimburse * 10000
      }
      if (this.projectDuty.bonus) {
        this.projectDuty.bonus = this.projectDuty.bonus * 10000
      }
      const params = { duty: this.projectDuty, saveRegions: saveRegions, deleteRegions: deleteRegions }
      const me = this
      this.$confirm({
        title: '是否提交本项目责任书？',
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
          me.btnStatus.commitbtnStatus = false
        },
        onCancel () {
          me.spinning = true
          doSaveProjectDuty(params)
            .then(res => {
              if (res.code === 200) {
                me.currentProjectDutyId = res.body
                me.spinning = false
                me.$message.success(msg)
                me.$emit('refresh', me.currentProjectDutyId, 'read')
                me.loadProjectDutyInfo()
                me.infoTabPane.hasChanged = false
              }
              me.btnStatus.commitbtnStatus = false
              me.spinning = false
            })
        }
      })
    },
    onDrawerClose () {
      this.$emit('closeDrawer', true)
    },
    loadProjectDutyInfo () {
      this.spinning = true
      loadProjectDutyInfo({ dutyId: this.currentProjectDutyId })
        .then(res => {
          if (res.code === 200) {
            this.basicInfo = res.body
            this.basicInfo.startDate = moment(this.basicInfo.startDate)
            this.basicInfo.endDate = moment(this.basicInfo.endDate)
            this.basicInfoForm = { ...this.basicInfo }
            this.basicInfoForm.assessmentCycle = [this.basicInfoForm.startDate, this.basicInfoForm.endDate]
            this.projectModalQueryParam.customerId = this.basicInfo.customerId
            this.totalCost = this.basicInfo.budgetTotalCost
            Object.assign(this.dutyInfo, this.basicInfoForm)
            this.loadProjectRegionList()
            if (this.readOnly) {
              if (this.basicInfoForm.reimburse > 0) {
                this.basicInfoForm.reimburse = Number(this.basicInfoForm.reimburse).toFixed(2)
              }
              if (this.basicInfoForm.laborCost > 0) {
                this.basicInfoForm.laborCost = Number(this.basicInfoForm.laborCost).toFixed(2)
              }
              if (this.basicInfoForm.bonus > 0) {
                this.basicInfoForm.bonus = Number(this.basicInfoForm.bonus).toFixed(2)
              }
            }
          }
          this.spinning = false
        })
    },
    initPage () {
      this.infoTabPane.key = '1'
      if (this.operate === 'read' || this.operate === 'audit') {
        this.currentProjectDutyId = this.dutyId
        this.loadProjectDutyInfo()
        this.readOnly = true
      }
      if (this.operate === 'modify') {
        this.currentProjectDutyId = this.dutyId
        this.loadProjectDutyInfo()
        this.readOnly = false
      }
      if (this.operate === 'create') {
        this.readOnly = false
      }
    }
  },
  mounted () {
    this.initPage()
  },
  computed: {
    dutyName: function () {
      this.doGenerateName(!this.basicInfoForm.startDate || !this.basicInfoForm.endDate || !this.basicInfoForm.customerId)
      return this.basicInfoForm.name
    },
    totalWeight: function () {
      return this.calculateTotalWeight()
    }
  }
}
</script>

<style scoped>
  /deep/ .ant-calendar-picker-input.ant-input {
    line-height: 1.5;
    color: #000000;
    background: #ffffff;
  }
  .errorClass {
    border: 1px solid red;
    border-radius: 4px;
  }

</style>
