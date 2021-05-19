<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <a-row style="margin-bottom: 10px;margin-top:10px;">
      <span style="margin-right:15px">统计年份：</span>
      <a-input-number v-model="startYear"/>
      <span style="margin-left:15px;margin-right:15px">至</span>
      <a-input-number v-model="endYear"/>
      <a-button type="primary" icon="search" style="margin-left:15px" @click="getList"></a-button>
      <a-divider type="vertical" />
      <a-button v-action:1 type="primary" icon="download" @click="doExport" :loading="isDownloading">导出</a-button>
    </a-row>
    <a-table
      v-watermark
      :bordered="false"
      :loading="isLoading"
      size="small"
      :rowKey="record => record.row_ID"
      :columns="columns"
      :dataSource="data"
      :pagination="false"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :scroll="{ x: 2880, y: listScrollHeight }">
      >
      <template slot="ContractSigningDate" slot-scope="ContractSigningDate">
        <span v-if="ContractSigningDate != null">
          {{ ContractSigningDate.substr(0,10) }}
        </span>
      </template>
      <template slot="ContractAssessmentDate" slot-scope="ContractAssessmentDate">
        <span v-if="ContractAssessmentDate != null">
          {{ ContractAssessmentDate.substr(0,10) }}
        </span>
      </template>
      <template slot="ContractAmount" slot-scope="ContractAmount">
        {{ ContractAmount | NumberFormat }}
      </template>
      <template slot="ContractSoftwareAmount" slot-scope="ContractSoftwareAmount">
        {{ ContractSoftwareAmount | NumberFormat }}
      </template>
      <template slot="SoftwareServiceAmount" slot-scope="SoftwareServiceAmount">
        {{ SoftwareServiceAmount | NumberFormat }}
      </template>
      <template slot="ProjectAmount" slot-scope="ProjectAmount">
        {{ ProjectAmount | NumberFormat }}
      </template>
    </a-table>
    <footer-tool-bar>
      <a-pagination
        :total="pagination.total"
        :pageSize.sync="pagination.pageSize"
        v-model="pagination.current"
        @change="handleCurrentPageChange"
        :showTotal="total => `共 ${total} 条`"
        style="margin-top: 10px"/>
    </footer-tool-bar>
  </a-card>
</template>

<script>
import FooterToolBar from '@/components/FooterToolbar'
import { getPmoneyAllByDep, exportPmoneyAllByDep } from '@/api/projectReport_manpowercost'
import moment from 'moment'
import { downFile } from '@/utils/util'
import store from '@/store'

const columns = [
  {
    key: 'row_ID',
    width: 50,
    dataIndex: 'row_ID',
    title: '序号',
    align: 'center'
  },
  {
    key: 'CareerGroupText',
    dataIndex: 'careergrouptext',
    width: 120,
    title: '事业群',
    className: 'center-th-header'
  },
  {
    key: 'LargeAreaText',
    dataIndex: 'largeareatext',
    width: 100,
    title: '大区',
    className: 'center-th-header'
  },
  {
    key: 'SmallAreaText',
    dataIndex: 'smallareatext',
    width: 100,
    title: '小区',
    className: 'center-th-header'
  },
  {
    key: 'MoneyBackDeptText',
    dataIndex: 'moneybackdepttext',
    width: 120,
    title: '回款业绩部门',
    className: 'center-th-header'
  },
  {
    key: 'SaleDeptText',
    dataIndex: 'saledepttext',
    width: 120,
    title: '销售业绩部门',
    className: 'center-th-header'
  },
  {
    key: 'CustomerCode',
    dataIndex: 'customercode',
    width: 100,
    title: '客户编码',
    align: 'center'
  },
  {
    key: 'CustomerName',
    dataIndex: 'customername',
    width: 200,
    title: '客户名称',
    className: 'center-th-header'
  },
  {
    key: 'ContractNo',
    dataIndex: 'contractno',
    width: 100,
    title: '合同编号',
    className: 'center-th-header'
  },
  {
    key: 'ContractName',
    dataIndex: 'contractname',
    width: 200,
    title: '合同名称',
    className: 'center-th-header'
  },
  {
    key: 'ContractAmount',
    dataIndex: 'contractamount',
    width: 140,
    title: '合同金额(元)',
    scopedSlots: { customRender: 'ContractAmount' },
    className: 'center-th-header',
    align: 'right'
  },
  {
    key: 'ContractSoftwareAmount',
    dataIndex: 'contractsoftwareamount',
    width: 140,
    title: '合同软件金额(元)',
    scopedSlots: { customRender: 'ContractSoftwareAmount' },
    className: 'center-th-header',
    align: 'right'
  },
  {
    key: 'SoftwareServiceAmount',
    dataIndex: 'softwareserviceamount',
    width: 140,
    title: '软件与服务金额(元)',
    scopedSlots: { customRender: 'SoftwareServiceAmount' },
    className: 'center-th-header',
    align: 'right'
  },
  {
    key: 'DiscountRate',
    dataIndex: 'discountrate',
    width: 70,
    title: '折扣',
    align: 'center'
  },
  {
    key: 'ContractSigningDate',
    dataIndex: 'contractsigningdate',
    width: 120,
    title: '合同签订日期',
    scopedSlots: { customRender: 'ContractSigningDate' },
    align: 'center'
  },
  {
    key: 'ContractAssessmentDate',
    dataIndex: 'contractassessmentdate',
    width: 120,
    title: '合同考核日期',
    scopedSlots: { customRender: 'ContractAssessmentDate' },
    align: 'center'
  },
  {
    key: 'ProjectId',
    dataIndex: 'projectid',
    width: 100,
    title: '项目ID',
    align: 'center'
  },
  {
    key: 'ProjectName',
    dataIndex: 'projectname',
    width: 200,
    title: '项目名称',
    className: 'center-th-header'
  },
  {
    key: 'ProjectAmount',
    dataIndex: 'projectamount',
    width: 140,
    title: '项目金额(元)',
    scopedSlots: { customRender: 'ProjectAmount' },
    className: 'center-th-header',
    align: 'right'
  },
  {
    key: 'ProjectFlagText',
    dataIndex: 'projectflagtext',
    width: 100,
    title: '项目类别',
    align: 'center'
  },
  {
    key: 'ProjectTypeText',
    dataIndex: 'projecttypetext',
    width: 100,
    title: '项目类型',
    align: 'center'
  },
  {
    key: 'AcceptanceStamp',
    dataIndex: 'acceptancestamp',
    width: 100,
    title: '验收标记',
    align: 'center'
  },
  {
    key: 'DepType',
    dataIndex: 'deptype',
    width: 100,
    title: '人力成本金额产生部门类别',
    align: 'center'
  },
  {
    key: 'amount',
    dataIndex: 'amount',
    width: 100,
    title: '人力成本金额(元)',
    align: 'center'
  }
]
export default {
  name: 'C04',
  components: {
    FooterToolBar
  },
  data () {
    return {
      isDownloading: false,
      selectedRow: '',
      startYear: 2010,
      endYear: null,
      cardHeight: 0,
      isLoading: false,
      columns,
      data: [],
      listScrollHeight: 0,
      pagination: {
        total: 0,
        current: 1,
        pageSize: 25 // 每页中显示10条数据
      },
      queryParam: {
        startYear: null,
        endYear: null,
        pageSize: 25,
        pageNo: 1
      }
    }
  },
  created () {
    this.getWidthAndHeight()
    var currentYear = moment().year()
    this.endYear = currentYear
  },
  methods: {
    moment,
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.row_ID
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.row_ID === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    handleCurrentPageChange (pageNo) {
      this.queryParam.pageNo = pageNo
      this.getList()
    },
    getWidthAndHeight () {
      this.cardHeight = window.innerHeight - 125
      this.listScrollHeight = window.innerHeight - 320
    },
    getList () {
      this.isLoading = true
      this.queryParam.startYear = this.startYear
      this.queryParam.endYear = this.endYear
      const params = this.queryParam
      getPmoneyAllByDep(params).then(res => {
        if (res.code === 200) {
          this.pagination.total = res.body.totalCount
          this.pagination.pageSize = this.queryParam.pageSize
          this.pagination.current = this.queryParam.pageNo
          this.data = res.body.items
        }
        this.isLoading = false
      }).catch(err => {
        this.isLoading = false
      })
    },
    doExport () {
      const params = {}
      this.queryParam.startYear = this.startYear
      this.queryParam.endYear = this.endYear
      Object.assign(params, this.queryParam)
      params.menuId = this.$route.meta.id // 菜单id
      params.context = this.$route.meta.title + '-C04' // 菜单名称
      params.personId = store.getters.userInfo.personId // 用户id
      params.system = 13 // 系统
      this.isDownloading = true
      exportPmoneyAllByDep(params).then(res => {
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
        this.isDownloading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
