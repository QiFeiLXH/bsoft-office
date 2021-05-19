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
      :scroll="{ x: 6340, y: listScrollHeight }">
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
import { getContractLevelworkloadAllByDeppByMonth, exportContractLevelworkloadAllByDeppByMonth } from '@/api/projectReport_manpowercost'
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
    key: 'Year',
    dataIndex: 'year',
    width: 70,
    title: '人力成本工作量年度',
    align: 'center'
  },
  {
    key: 'Month',
    dataIndex: 'month',
    width: 100,
    title: '人力成本工作量核算月份',
    align: 'center'
  },
  {
    key: 'DEPTYPE',
    dataIndex: 'deptype',
    width: 70,
    title: '人力成本工作量产生部门类别',
    align: 'center'
  },
  {
    key: 'Workload',
    dataIndex: 'workload',
    width: 70,
    title: '人力成本工作量(人/天)',
    align: 'center'
  },
  {
    key: 'T00',
    dataIndex: 't00',
    width: 70,
    title: 'T00',
    align: 'center'
  },
  {
    key: 'T01',
    dataIndex: 't01',
    width: 70,
    title: 'T01',
    align: 'center'
  },
  {
    key: 'T02',
    dataIndex: 't02',
    width: 70,
    title: 'T02',
    align: 'center'
  },
  {
    key: 'T03',
    dataIndex: 't03',
    width: 70,
    title: 'T03',
    align: 'center'
  },
  {
    key: 'T04',
    dataIndex: 't04',
    width: 70,
    title: 'T04',
    align: 'center'
  },
  {
    key: 'T05',
    dataIndex: 't05',
    width: 70,
    title: 'T05',
    align: 'center'
  },
  {
    key: 'T06',
    dataIndex: 't06',
    width: 70,
    title: 'T06',
    align: 'center'
  },
  {
    key: 'T07',
    dataIndex: 't07',
    width: 70,
    title: 'T07',
    align: 'center'
  },
  {
    key: 'T08',
    dataIndex: 't08',
    width: 70,
    title: 'T08',
    align: 'center'
  },
  {
    key: 'T09',
    dataIndex: 't09',
    width: 70,
    title: 'T09',
    align: 'center'
  },
  {
    key: 'T10',
    dataIndex: 't10',
    width: 70,
    title: 'T10',
    align: 'center'
  },
  {
    key: 'T11',
    dataIndex: 't11',
    width: 70,
    title: 'T11',
    align: 'center'
  },
  {
    key: 'T12',
    dataIndex: 't12',
    width: 70,
    title: 'T12',
    align: 'center'
  },
  {
    key: 'T13',
    dataIndex: 't13',
    width: 70,
    title: 'T13',
    align: 'center'
  },
  {
    key: 'T14',
    dataIndex: 't14',
    width: 70,
    title: 'T14',
    align: 'center'
  },
  {
    key: 'T15',
    dataIndex: 't15',
    width: 70,
    title: 'T15',
    align: 'center'
  },
  {
    key: 'T16',
    dataIndex: 't16',
    width: 70,
    title: 'T16',
    align: 'center'
  },
  {
    key: 'T17',
    dataIndex: 't17',
    width: 70,
    title: 'T17',
    align: 'center'
  },
  {
    key: 'T18',
    dataIndex: 't18',
    width: 70,
    title: 'T18',
    align: 'center'
  },
  {
    key: 'T19',
    dataIndex: 't19',
    width: 70,
    title: 'T19',
    align: 'center'
  },
  {
    key: 'T20',
    dataIndex: 't20',
    width: 70,
    title: 'T20',
    align: 'center'
  },
  {
    key: 'T21',
    dataIndex: 't21',
    width: 70,
    title: 'T21',
    align: 'center'
  },
  {
    key: 'T22',
    dataIndex: 't22',
    width: 70,
    title: 'T22',
    align: 'center'
  },
  {
    key: 'T23',
    dataIndex: 't23',
    width: 70,
    title: 'T23',
    align: 'center'
  },
  {
    key: 'T24',
    dataIndex: 't24',
    width: 70,
    title: 'T24',
    align: 'center'
  },
  {
    key: 'T25',
    dataIndex: 't25',
    width: 70,
    title: 'T25',
    align: 'center'
  },
  {
    key: 'T26',
    dataIndex: 't26',
    width: 70,
    title: 'T26',
    align: 'center'
  },
  {
    key: 'T27',
    dataIndex: 't27',
    width: 70,
    title: 'T27',
    align: 'center'
  },
  {
    key: 'T28',
    dataIndex: 't28',
    width: 70,
    title: 'T28',
    align: 'center'
  },
  {
    key: 'T29',
    dataIndex: 't29',
    width: 70,
    title: 'T29',
    align: 'center'
  },
  {
    key: 'T30',
    dataIndex: 't30',
    width: 70,
    title: 'T30',
    align: 'center'
  },
  {
    key: 'T31',
    dataIndex: 't31',
    width: 70,
    title: 'T31',
    align: 'center'
  },
  {
    key: 'T32',
    dataIndex: 't32',
    width: 70,
    title: 'T32',
    align: 'center'
  },
  {
    key: 'T33',
    dataIndex: 't33',
    width: 70,
    title: 'T33',
    align: 'center'
  },
  {
    key: 'T34',
    dataIndex: 't34',
    width: 70,
    title: 'T34',
    align: 'center'
  },
  {
    key: 'T35',
    dataIndex: 't35',
    width: 70,
    title: 'T35',
    align: 'center'
  },
  {
    key: 'T36',
    dataIndex: 't36',
    width: 70,
    title: 'T36',
    align: 'center'
  },
  {
    key: 'T37',
    dataIndex: 't37',
    width: 70,
    title: 'T37',
    align: 'center'
  },
  {
    key: 'T38',
    dataIndex: 't38',
    width: 70,
    title: 'T38',
    align: 'center'
  },
  {
    key: 'T39',
    dataIndex: 't39',
    width: 70,
    title: 'T39',
    align: 'center'
  },
  {
    key: 'T40',
    dataIndex: 't40',
    width: 70,
    title: 'T40',
    align: 'center'
  },
  {
    key: 'P0',
    dataIndex: 'p0',
    width: 70,
    title: 'P0',
    align: 'center'
  },
  {
    key: 'P1',
    dataIndex: 'p1',
    width: 70,
    title: 'P1',
    align: 'center'
  },
  {
    key: 'P2',
    dataIndex: 'p2',
    width: 70,
    title: 'P2',
    align: 'center'
  },
  {
    key: 'P3',
    dataIndex: 'p3',
    width: 70,
    title: 'P3',
    align: 'center'
  },
  {
    key: 'P4',
    dataIndex: 'p4',
    width: 70,
    title: 'P4',
    align: 'center'
  },
  {
    key: 'P5',
    dataIndex: 'p5',
    width: 70,
    title: 'P5',
    align: 'center'
  },
  {
    key: 'P6',
    dataIndex: 'p6',
    width: 70,
    title: 'P6',
    align: 'center'
  },
  {
    key: 'P7',
    dataIndex: 'p7',
    width: 70,
    title: 'P7',
    align: 'center'
  },
  {
    key: 'P8',
    dataIndex: 'p8',
    width: 70,
    title: 'P8',
    align: 'center'
  },
  {
    key: 'P9',
    dataIndex: 'p9',
    width: 70,
    title: 'P9',
    align: 'center'
  },
  {
    key: 'P10',
    dataIndex: 'p10',
    width: 70,
    title: 'P10',
    align: 'center'
  },
  {
    key: 'P11',
    dataIndex: 'p11',
    width: 70,
    title: 'P11',
    align: 'center'
  },
  {
    key: 'P12',
    dataIndex: 'p12',
    width: 70,
    title: 'P12',
    align: 'center'
  },
  {
    key: 'P13',
    dataIndex: 'p13',
    width: 70,
    title: 'P13',
    align: 'center'
  },
  {
    key: 'P14',
    dataIndex: 'p14',
    width: 70,
    title: 'P14',
    align: 'center'
  },
  {
    key: 'P15',
    dataIndex: 'p15',
    width: 70,
    title: 'P15',
    align: 'center'
  }
]
export default {
  name: 'B12',
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
  mounted () {
    // this.getList()
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
    getWidthAndHeight () {
      this.cardHeight = window.innerHeight - 125
      this.listScrollHeight = window.innerHeight - 382
    },
    handleCurrentPageChange (pageNo) {
      this.queryParam.pageNo = pageNo
      this.getList()
    },
    getList () {
      this.isLoading = true
      this.queryParam.startYear = this.startYear
      this.queryParam.endYear = this.endYear
      const params = this.queryParam
      getContractLevelworkloadAllByDeppByMonth(params).then(res => {
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
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.row_ID === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    doExport () {
      const params = {}
      this.queryParam.startYear = this.startYear
      this.queryParam.endYear = this.endYear
      Object.assign(params, this.queryParam)
      params.menuId = this.$route.meta.id // 菜单id
      params.context = this.$route.meta.title + '-B12' // 菜单名称
      params.personId = store.getters.userInfo.personId // 用户id
      params.system = 13 // 系统
      this.isDownloading = true
      exportContractLevelworkloadAllByDeppByMonth(params).then(res => {
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
