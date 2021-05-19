<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row style="margin-bottom: 10px;margin-top:10px;">
          <a-col>
            <span style="margin-right:15px">年份：</span>
            <a-input-number v-model="dutyYear"/>
            <a-radio-group v-model="queryParam.auditFlag" @change="onAuditFlagChange" style="margin-left: 30px">
              <a-radio :value="-1">全部</a-radio>
              <a-radio :value="1">已审</a-radio>
              <a-radio :value="0">未审</a-radio>
            </a-radio-group>
            <a-button type="primary" icon="search" @click="doQuery" style="margin-left: 30px">查询</a-button>
            <a-divider type="vertical" />
            <a-button type="primary" @click="doOperate('create')">创建</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="dutyLetterColumns"
      :height="tableHeight"
      :data="loadTableList"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :showSizeChanger="false"
      :pageSize="pagination.pageSize"
      :pageNum="pagination.pageNumber"
      :showPagination="true"
      :bodyStyle="{ minHeight:listScrollHeight+'px' }"
      :scroll="{ x: false, y: listScrollHeight }"
    >
      <template slot="rowIndex" slot-scope="text, record, index">
        <span>
          {{ (pagination.pageNumber - 1) * pagination.pageSize + index + 1 }}
        </span>
      </template>
      <template slot="budgetTotalCost" slot-scope="text">
        <span v-if="text > 0">{{ text.toFixed(2) | NumberFormat }}</span>
      </template>
      <template slot="expectedBackMoney" slot-scope="text">
        <span v-if="text > 0">{{ text.toFixed(2) | NumberFormat }}</span>
      </template>
      <template slot="auditFlag" slot-scope="text">
        <a-badge :status="text | statusTypeFilter" :text="text | statusFilter"/>
      </template>
      <template slot="signDate" slot-scope="text">
        <span>{{ text | DateFormat }}</span>
      </template>
      <span slot="operation" slot-scope="text, record">
        <template>
          <a @click="doOperate('read', record)">查看</a>
          <a-divider type="vertical" v-if="record.auditFlag === 0 && record.committed !== 1"/>
          <a @click="doOperate('modify', record)" v-if="record.auditFlag === 0 && record.committed !== 1">修改</a>
          <a-divider type="vertical" v-if="record.auditFlag === 0 && record.milepostSelectedFlag === 0 && record.committed !== 1"/>
          <a-popconfirm title="是否要删除此行？" @confirm="doRemoveDuty(record.id)" v-if="record.auditFlag === 0 && record.milepostSelectedFlag === 0 && record.committed !== 1">
            <a>删除</a>
          </a-popconfirm>
        </template>
      </span>
    </s-table>
    <a-drawer
      :wrapStyle="{overflow: 'hidden'}"
      placement="right"
      :closable="false"
      :width="950"
      @close="onDrawerClose"
      :visible="drawerVisible"
      :bodyStyle="{ padding: '0px 0px 0px 0px' }"
    >
      <a-tabs :activeKey="activeKey" @change="onTabChange" size="small">
        <a-tab-pane key="1" tab="基本信息">
          <basic-info
            ref="basicInfo"
            :dutyId="dutyId"
            :infoTabPane="infoTabPane"
            :operate="operate"
            v-if="drawerVisible"
            :dutyInfo="dutyInfo"
            :btnStatus="btnStatus"
            :alertData="alertData"
            @refresh="refreshTable"
            @resetActiveKey="resetActiveKey"
            @closeDrawer="onDrawerClose"></basic-info>
        </a-tab-pane>
        <a-tab-pane key="2" tab="里程碑设置" v-if="operate !=='create'">
          <milepost-setting
            ref="milepost"
            v-if="drawerVisible && activeKey === '2'"
            :dutyId="dutyId"
            :infoTabPane="infoTabPane"
            :dutyRegions="dutyRegions"
            :btnStatus="btnStatus"
            :alertData="alertData"
            @resetDutyRegions="resetDutyRegions"
            :operate="operate"></milepost-setting>
        </a-tab-pane>
        <a-tab-pane key="3" tab="计划回款" v-if="operate !=='create'">
          <plan-back-money
            ref="backMoney"
            v-if="drawerVisible && activeKey === '3'"
            :dutyId="dutyId"
            :infoTabPane="infoTabPane"
            :btnStatus="btnStatus"
            :operate="operate"
            @refresh="refreshTable"></plan-back-money>
        </a-tab-pane>
      </a-tabs>
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
        <a-button type="primary" icon="file-done" v-if="!readOnly" @click="doCommit" :loading="btnStatus.commitbtnStatus">提交</a-button>
        <a-button
          type="primary"
          icon="check"
          v-if="!readOnly"
          :loading="btnStatus.savebtnStatus"
          @click="doSave"
          style="margin-left: 30px;">保存
        </a-button>
        <a-button key="back" icon="close" @click="onDrawerClose" style="margin-left: 20px">关闭</a-button>
      </div>
    </a-drawer>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { BasicInfo, MilepostSetting, PlanBackMoney } from '@/module/project/duty'
import { loadDutyMaintainQueryList, doDeleteProjectDuty } from '@/api/projectDutyMaintain'
import moment from 'moment/moment'

const statusMap = {
  0: {
    status: 'default',
    text: '未审'
  },
  1: {
    status: 'success',
    text: '已审'
  }
}
const paneMap = {
  '1': {
    text: '基本信息'
  },
  '2': {
    text: '里程碑设置'
  },
  '3': {
    text: '计划回款'
  }
}
export default {
  name: 'DutyLetterMaintain',
  components: {
    STable,
    BasicInfo,
    MilepostSetting,
    PlanBackMoney
  },
  data () {
    return {
      moment,
      dutyLetterColumns: [
        {
          dataIndex: 'rowIndex',
          title: '',
          width: '4%',
          scopedSlots: { customRender: 'rowIndex' }
        },
        {
          dataIndex: 'name',
          width: '17%',
          title: '责任书名称'
        },
        {
          dataIndex: 'contractNo',
          width: '10%',
          title: '合同编号'
        },
        {
          dataIndex: 'startDate',
          width: '10%',
          title: '开始日期'
        },
        {
          dataIndex: 'endDate',
          width: '10%',
          title: '结束日期'
        },
        {
          dataIndex: 'budgetTotalCost',
          width: '9%',
          title: '预算总成本（万元）',
          scopedSlots: { customRender: 'budgetTotalCost' },
          align: 'center'
        },
        {
          dataIndex: 'expectedBackMoney',
          width: '9%',
          title: '计划回款（万元）',
          scopedSlots: { customRender: 'expectedBackMoney' },
          align: 'center'
        },
        {
          dataIndex: 'signDate',
          width: '10%',
          title: '签定日期',
          scopedSlots: { customRender: 'signDate' }
        },
        {
          dataIndex: 'auditFlag',
          width: '8%',
          title: '状态',
          scopedSlots: { customRender: 'auditFlag' }
        },
        {
          dataIndex: 'operation',
          width: '13%',
          title: '操作',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      cardHeight: 0,
      tableHeight: 0,
      listScrollHeight: 0,
      rowSelected: '',
      rowSelectedInfo: {},
      dutyYear: undefined,
      queryParam: { pageSize: 25, auditFlag: -1, year: null },
      loadTableList: parameter => {
        return loadDutyMaintainQueryList(Object.assign(parameter, this.queryParam)).then(res => {
          if (res.code === 200) {
            this.pagination.pageNumber = res.body.pageNumber + 1
            this.pagination.totalCount = res.body.totalCount
            return res.body
          }
        })
      },
      pagination: { pageNumber: 1, pageSize: 25, totalCount: 1 },
      drawerVisible: false,
      operate: '',
      activeKey: '1',
      readOnly: false,
      dutyId: null,
      infoTabPane: {
        key: '1',
        hasChanged: false
      },
      dutyInfo: {
        id: null,
        customerId: null,
        customerName: null,
        startDate: null,
        endDate: null,
        name: null,
        laborCost: null,
        reimburse: null,
        bonus: null,
        backMoney: null,
        expectedBackMoney: null,
        budgetTotalCost: null,
        assessmentCycle: []
      },
      dutyRegions: [],
      regionsData: [],
      btnStatus: {
        savebtnStatus: false,
        commitbtnStatus: false
      },
      alertData: {
        alertType: 'warning',
        isAlert: false,
        alertMsg: ''
      }
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  methods: {
    refreshTable (dutyId, op) {
      if (op === 'read') {
        this.readOnly = true
      }
      this.operate = op
      this.dutyId = dutyId
      setTimeout(() => {
        this.$refs.table.refresh() // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onAuditFlagChange (val) {
      this.queryParam.auditFlag = val.target.value
      this.rowSelected = ''
      this.rowSelectedInfo = {}
      this.dutyId = null
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    doQuery () {
      this.rowSelected = ''
      this.rowSelectedInfo = {}
      this.dutyId = null
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    doOperate (op, record) {
      this.operate = op
      if (op === 'modify') {
        this.rowSelected = record.id
        this.rowSelectedInfo = record
        this.dutyId = record.id
        this.readOnly = false
      }
      if (op === 'read') {
        this.rowSelected = record.id
        this.rowSelectedInfo = record
        this.dutyId = record.id
        this.readOnly = true
      }
      if (op === 'create') {
        this.readOnly = false
      }
      this.drawerVisible = true
      this.infoTabPane.key = '1'
      this.infoTabPane.hasChanged = false
    },
    doRemoveDuty (id) {
      const param = { dutyId: id }
      doDeleteProjectDuty(param)
        .then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功！')
            this.refreshTable()
          }
        })
    },
    doCommit () {
      this.btnStatus.commitbtnStatus = true
      this.alertData.isAlert = false
      if (this.activeKey === '1') {
        this.$refs.basicInfo.handleCommitProjectDuty()
      }
      if (this.activeKey === '2') {
        if (this.$refs.milepost.validateMilepost()) {
          this.$refs.basicInfo.handleCommitProjectDuty(this.dutyRegions)
        }
      }
      if (this.activeKey === '3') {
        this.$refs.basicInfo.handleCommitProjectDuty()
      }
    },
    doSave () {
      this.btnStatus.savebtnStatus = true
      this.alertData.isAlert = false
      if (this.activeKey === '1') {
        this.$refs.basicInfo.handleSaveProjectDuty()
      }
      if (this.activeKey === '2') {
        this.$refs.milepost.handleSaveMileposts()
      }
      if (this.activeKey === '3') {
        this.$refs.backMoney.handleSaveProjectDutyPayment()
      }
    },
    onDrawerClose () {
      this.drawerVisible = false
      this.activeKey = '1'
      this.alertData.isAlert = false
      this.alertData.alertType = 'warning'
      this.alertData.alertMsg = ''
      this.btnStatus.savebtnStatus = false
      this.btnStatus.commitbtnStatus = false
    },
    resetActiveKey (data) {
      if (this.activeKey === data.key) {
        return
      }
      if (this.infoTabPane.hasChanged) {
        var msg = paneMap[this.infoTabPane.key].text + '-数据修改未保存，是否继续？'
        const me = this
        this.$confirm({
          title: msg,
          cancelText: '取消',
          onCancel () {
          },
          okText: '继续',
          onOk () {
            me.activeKey = data.key
            me.infoTabPane.hasChanged = false
          }
        })
      } else {
        this.activeKey = data.key
      }
    },
    resetDutyRegions (regions) {
      this.$refs.basicInfo.resetDutyRegions(regions)
    },
    onTabChange (key) {
      if (this.infoTabPane.hasChanged) {
        var msg = paneMap[this.infoTabPane.key].text + '-数据修改未保存，是否继续？'
        const me = this
        this.$confirm({
          title: msg,
          cancelText: '取消',
          onCancel () {
          },
          okText: '继续',
          onOk () {
            me.activeKey = key
            me.infoTabPane.hasChanged = false
          }
        })
      } else {
        this.activeKey = key
        if (key === '1') {
          this.$refs.basicInfo.loadProjectDutyInfo()
        }
      }
      this.alertData.isAlert = false
      this.alertData.alertType = 'warning'
      this.alertData.alertMsg = ''
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.rowSelected = record.id
            this.rowSelectedInfo = record
            this.dutyId = record.id
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.id === this.rowSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    getWidthAndHeight () {
      this.listScrollHeight = window.innerHeight - 270
      this.cardHeight = window.innerHeight - 85
    },
    initParam () {
      var currentYear = moment().year()
      this.dutyYear = currentYear
      this.queryParam['year'] = this.dutyYear
    }
  },
  created () {
    this.initParam()
    this.getWidthAndHeight()
  },
  watch: {
    dutyYear (val) {
      this.queryParam['year'] = val
    }
  }
}
</script>

<style scoped>

</style>
