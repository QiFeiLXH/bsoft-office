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
            <span>年份：</span>
            <!--            <a-date-picker  v-model="startDate" style="width: 130px"/>-->
            <a-input-number v-model="queryParam.startYear"/>
            <span style="margin:0 5px">至</span>
            <!--            <a-date-picker  v-model="endDate"  style="width: 130px"/>-->
            <a-input-number v-model="queryParam.endYear"/>
            <a-input-search placeholder="责任书名称" v-model="queryParam.dutyName" @pressEnter="doRefresh" @search="doRefresh" style="margin:0px 20px;width: 300px"/>
            <a-button type="primary" @click="doRefresh">
              <a-icon type="sync" :spin="refreshSpining"></a-icon>
              刷新
            </a-button>
            <a-divider type="vertical" />
            <a-button v-action:1 type="primary" @click="doExport" icon="file-excel" :loading="isDownloading">导出</a-button>
          </a-col>
        </a-row>
        <a-row>
          <a-col>
            <a-radio-group v-model="queryParam.auditFlag" @change="onAuditFlagChange" style="margin-bottom: 10px;margin-top:10px;">
              <a-radio :value="-1">全部</a-radio>
              <a-radio :value="1">已审核</a-radio>
              <a-radio :value="0">未审核</a-radio>
            </a-radio-group>
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
      <template slot="planBackMoney" slot-scope="text">
        <span v-if="text > 0">{{ text.toFixed(2) | NumberFormat }}</span>
      </template>
      <template slot="auditFlag" slot-scope="text">
        <a-badge :status="text | statusTypeFilter" :text="text | statusFilter"/>
      </template>
      <span slot="operation" slot-scope="text, record">
        <template>
          <a @click="doOperate('read', record)" v-if="record.auditFlag === 1 || record.committed !== 1">查看</a>
          <a @click="doOperate('audit', record)" v-else>审核</a>
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
            :operate="operate"
            :dutyInfo="dutyInfo"
            :infoTabPane="infoTabPane"
            :btnStatus="btnStatus"
            :alertData="alertData"
            v-if="drawerVisible && activeKey === '1'"
            @closeDrawer="onDrawerClose"></basic-info>
        </a-tab-pane>
        <a-tab-pane key="2" tab="里程碑设置" v-if="operate !=='create'">
          <milepost-setting
            ref="milepost"
            :dutyRegions="dutyRegions"
            :btnStatus="btnStatus"
            :alertData="alertData"
            :dutyId="rowSelected"
            :infoTabPane="infoTabPane"
            :operate="operate"
            v-if="drawerVisible && activeKey === '2'"></milepost-setting>
        </a-tab-pane>
        <a-tab-pane key="3" tab="计划回款" v-if="operate !=='create'">
          <plan-back-money
            ref="backMoney"
            :dutyId="rowSelected"
            :infoTabPane="infoTabPane"
            :btnStatus="btnStatus"
            :operate="operate"
            v-if="drawerVisible && activeKey === '3'"></plan-back-money>
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
        <a-button type="primary" icon="check" style="margin-left: 20px" v-if="operate === 'audit'" @click="doAuditOne">审核同意</a-button>
        <a-button key="back" icon="close" @click="onDrawerClose" style="margin-left: 20px">关闭</a-button>
      </div>
    </a-drawer>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { BasicInfo, MilepostSetting, PlanBackMoney } from '@/module/project/duty'
import { loadDutyAuditQueryList, auditDutyList, exportDutyAuditList } from '@/api/projectDutyManager'
import moment from 'moment/moment'
import { downFile } from '@/utils/util'
import store from '@/store'

const statusMap = {
  0: {
    status: 'default',
    text: '未审核'
  },
  1: {
    status: 'success',
    text: '已审核'
  }
}
export default {
  name: 'DutyLetterAudit',
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
          title: '序号',
          width: '10%',
          scopedSlots: { customRender: 'rowIndex' },
          align: 'center'
        },
        {
          dataIndex: 'name',
          width: '36%',
          title: '责任书名称'
        },
        {
          dataIndex: 'largeBackMoneyDeptText',
          width: '10%',
          title: '回款业绩一级部门'
        },
        {
          dataIndex: 'backMoneyDeptText',
          width: '8%',
          title: '回款业绩部门'
        },
        {
          dataIndex: 'budgetTotalCost',
          width: '10%',
          title: '预算总成本（万元）',
          scopedSlots: { customRender: 'budgetTotalCost' },
          align: 'center'
        },
        {
          dataIndex: 'planBackMoney',
          width: '8%',
          title: '计划回款（万元）',
          scopedSlots: { customRender: 'planBackMoney' },
          align: 'center'
        },
        {
          dataIndex: 'year',
          width: '5%',
          title: '年份'
        },
        {
          dataIndex: 'projectManagerName',
          width: '8%',
          title: '项目经理'
        },
        {
          dataIndex: 'auditFlag',
          width: '10%',
          title: '审核情况',
          scopedSlots: { customRender: 'auditFlag' }
        },
        {
          dataIndex: 'operation',
          width: '5%',
          title: '操作',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      cardHeight: 0,
      tableHeight: 0,
      listScrollHeight: 0,
      windowWidth: 0,
      rowSelected: '',
      rowSelectedInfo: {},
      startDate: null,
      endDate: null,
      // dutyYear: undefined,
      queryParam: { pageSize: 25, startYear: null, endYear: null, auditFlag: 1 },
      loadTableList: parameter => {
        this.rowSelected = ''
        this.rowSelectedInfo = {}
        return loadDutyAuditQueryList(Object.assign(parameter, this.queryParam)).then(res => {
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
      refreshSpining: false,
      selectedRows: [],
      isDownloading: false,
      activeKey: '1',
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
    refreshTable () {
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onAuditFlagChange (val) {
      this.queryParam.auditFlag = val.target.value
      this.rowSelected = ''
      this.rowSelectedInfo = {}
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    doRefresh () {
      this.refreshSpining = true
      this.refreshTable()
      this.refreshSpining = false
    },
    Time (value) {
      const dateee = new Date(value).toJSON()
      const date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
      return date// .substring(0, 10)
    },
    doQuery () {
      this.rowSelected = ''
      this.rowSelectedInfo = {}
      this.dutyId = null
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    doAuditOne () {
      const me = this
      this.$confirm({ // 确定和关闭按钮 调换位置（只是调换了样式，和方法）
        title: '是否审核所选责任书？',
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
          me.saveData = []
          const data = {
            id: me.dutyId
          }
          me.saveData.push(data)
          auditDutyList(me.saveData).then(res => {
            if (res.code === 200) {
              me.$message.success('审核成功')
              me.doRefresh()
              me.saveData = []
              me.$refs.table.clearSelected()
              me.drawerVisible = false
            } else {
              me.$message.error(res.msg)
            }
          })
        }
      })
    },
    doOperate (op, record) {
      this.operate = op
      if (op === 'read' || op === 'audit') {
        this.rowSelected = record.id
        this.rowSelectedInfo = record
        this.dutyId = record.id
      }
      this.drawerVisible = true
    },
    doExport () {
      const params = {}
      Object.assign(params, this.queryParam)
      params.menuId = this.$route.meta.id // 菜单id
      params.context = this.$route.meta.title // 菜单名称
      params.personId = store.getters.userInfo.personId // 用户id
      params.system = 13 // 系统
      this.isDownloading = true
      exportDutyAuditList(params).then(res => {
        const headers = res.headers
        const contentType = headers['content-type']
        if (res.data) {
          const blob = new Blob([res.data], { type: contentType })
          const contentDisposition = res.headers['content-disposition']
          let fileName = 'unknown'
          if (contentDisposition) {
            fileName = window.decodeURI(res.headers['content-disposition'].split('=')[1])
          }
          downFile(blob, fileName)
        }
        this.isDownloading = false
      }).catch(error => {
        console.log(error)
        this.isDownloading = false
      })
    },
    onDrawerClose () {
      this.drawerVisible = false
      this.activeKey = '1'
    },
    onTabChange (key) {
      this.activeKey = key
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
      this.listScrollHeight = window.innerHeight - 315
      this.cardHeight = window.innerHeight - 100
      this.windowWidth = window.innerWidth
    },
    initParam () {
      var currentYear = moment().year()
      this.queryParam.startYear = currentYear
      this.queryParam.endYear = currentYear
    }
  },
  created () {
    this.initParam()
    this.getWidthAndHeight()
  }
}
</script>

<style scoped>

</style>
