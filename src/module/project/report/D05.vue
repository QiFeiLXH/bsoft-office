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
      <a-button type="primary" icon="search" style="margin-left:15px" @click="doQuery"></a-button>
      <a-divider type="vertical" />
      <a-button v-action:1 type="primary" icon="download" @click="doExport" :loading="isDownloading">导出</a-button>
    </a-row>
    <a-table
      v-watermark
      size="small"
      :rowKey="(record) => record.ROW_ID"
      :bordered="false"
      :loading="isLoading"
      :columns="columns"
      :dataSource="dataList"
      :pagination="false"
      :customRow="onClickRow"
      :scroll="{ x: 9410, y: listScrollHeight }"
      :rowClassName="setCurrentRow">
      <template slot="rowIndex" slot-scope="text, record, index">
        <span>
          {{ (page.pageNumber - 1) * page.pageSize + index + 1 }}
        </span>
      </template>
      <template slot="CONTRACTAMOUNT" slot-scope="text">
        {{ text | NumberFormat }}
      </template>
      <template slot="CONTRACTSOFTWAREAMOUNT" slot-scope="text">
        {{ text | NumberFormat }}
      </template>
      <template slot="SOFTWARESERVICEAMOUNT" slot-scope="text">
        {{ text | NumberFormat }}
      </template>
      <template slot="PROJECTAMOUNT" slot-scope="text">
        {{ text | NumberFormat }}
      </template>
    </a-table>
    <footer-tool-bar>
      <a-pagination
        :total="page.totalCount"
        :pageSize.sync="page.pageSize"
        v-model="page.pageNumber"
        @change="onPageChange"
        :showTotal="total => `共 ${total} 条`"
        style="margin-top: 10px"/>
    </footer-tool-bar>
  </a-card>
</template>

<script>
import { findProjectLevelReimbursementCostDepYear, exportProjectLevelReimbursementCostDepYear, getCostSubjectCloumns } from '@/api/projectReport_reimbursement'
import FooterToolBar from '@/components/FooterToolbar'
import { downFile } from '@/utils/util'
import store from '@/store'

import moment from 'moment/moment'

export default {
  name: 'D05',
  components: {
    FooterToolBar
  },
  data () {
    return {
      isDownloading: false,
      startYear: 2010,
      endYear: undefined,
      moment,
      cardHeight: 0,
      listScrollHeight: 0,
      selectedRow: '',
      queryParam: { pageNo: 1, pageSize: 25 },
      columns: [
        {
          key: 'rowIndex',
          width: 50,
          dataIndex: 'rowIndex',
          title: '序号',
          scopedSlots: { customRender: 'rowIndex' },
          align: 'center'
        },
        {
          key: 'CAREERGROUPTEXT',
          width: 120,
          dataIndex: 'CAREERGROUPTEXT',
          title: '事业群',
          className: 'center-th-header'
        },
        {
          key: 'LARGEAREATEXT',
          width: 100,
          dataIndex: 'LARGEAREATEXT',
          title: '大区',
          className: 'center-th-header'
        },
        {
          key: 'SMALLAREATEXT',
          width: 100,
          dataIndex: 'SMALLAREATEXT',
          title: '小区',
          className: 'center-th-header'
        },
        {
          key: 'MONEYBACKDEPTTEXT',
          width: 120,
          dataIndex: 'MONEYBACKDEPTTEXT',
          title: '回款业绩部门',
          className: 'center-th-header'
        },
        {
          key: 'SALEDEPTTEXT',
          width: 120,
          dataIndex: 'SALEDEPTTEXT',
          title: '销售业绩部门',
          className: 'center-th-header'
        },
        {
          key: 'CUSTOMERCODE',
          width: 100,
          dataIndex: 'CUSTOMERCODE',
          title: '客户编码',
          align: 'center'
        },
        {
          key: 'CUSTOMERNAME',
          width: 200,
          dataIndex: 'CUSTOMERNAME',
          title: '客户名称',
          className: 'center-th-header'
        },
        {
          key: 'CONTRACTNO',
          width: 100,
          dataIndex: 'CONTRACTNO',
          title: '合同编号',
          className: 'center-th-header'
        },
        {
          key: 'CONTRACTNAME',
          width: 200,
          dataIndex: 'CONTRACTNAME',
          title: '合同名称',
          className: 'center-th-header'
        },
        {
          key: 'CONTRACTAMOUNT',
          width: 100,
          dataIndex: 'CONTRACTAMOUNT',
          title: '合同金额(元)',
          scopedSlots: { customRender: 'CONTRACTAMOUNT' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'CONTRACTSOFTWAREAMOUNT',
          width: 140,
          dataIndex: 'CONTRACTSOFTWAREAMOUNT',
          title: '合同软件金额(元)',
          scopedSlots: { customRender: 'CONTRACTSOFTWAREAMOUNT' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'SOFTWARESERVICEAMOUNT',
          width: 140,
          dataIndex: 'SOFTWARESERVICEAMOUNT',
          title: '软件与服务金额(元)',
          scopedSlots: { customRender: 'SOFTWARESERVICEAMOUNT' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'DISCOUNT',
          width: 70,
          dataIndex: 'DISCOUNT',
          title: '折扣',
          align: 'center'
        },
        {
          key: 'CONTRACTSIGNINGDATE',
          width: 120,
          dataIndex: 'CONTRACTSIGNINGDATE',
          title: '合同签订日期',
          align: 'center'
        },
        {
          key: 'CONTRACTASSESSMENTDATE',
          width: 120,
          dataIndex: 'CONTRACTASSESSMENTDATE',
          title: '合同考核日期',
          align: 'center'
        },
        {
          key: 'PROJECTID',
          width: 100,
          dataIndex: 'PROJECTID',
          title: '项目ID',
          align: 'center'
        },
        {
          key: 'PROJECTNAME',
          width: 200,
          dataIndex: 'PROJECTNAME',
          title: '项目名称',
          className: 'center-th-header'
        },
        {
          key: 'PROJECTAMOUNT',
          width: 100,
          dataIndex: 'PROJECTAMOUNT',
          title: '项目金额(元)',
          scopedSlots: { customRender: 'PROJECTAMOUNT' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'PROJECTFLAGTEXT',
          width: 100,
          dataIndex: 'PROJECTFLAGTEXT',
          title: '项目类别',
          align: 'center'
        },
        {
          key: 'PROJECTTYPETEXT',
          width: 100,
          dataIndex: 'PROJECTTYPETEXT',
          title: '项目类型',
          align: 'center'
        },
        {
          key: 'ACCEPTANCESTAMP',
          width: 100,
          dataIndex: 'ACCEPTANCESTAMP',
          title: '验收标记',
          align: 'center'
        },
        {
          key: 'COSTYEAR',
          width: 80,
          dataIndex: 'COSTYEAR',
          title: '费用年度',
          align: 'center'
        },
        {
          key: 'DEPTYPETEXT',
          width: 120,
          dataIndex: 'DEPTYPETEXT',
          title: '费用产生部门类别',
          align: 'center'
        }
      ],
      dataList: [],
      isLoading: false,
      page: { pageNumber: 0, pageSize: 0, totalCount: 0 },
      costSubjects: []
    }
  },
  methods: {
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.ROW_ID
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.ROW_ID === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    doQuery () {
      this.isLoading = true
      const params = {}
      findProjectLevelReimbursementCostDepYear(Object.assign(params, this.queryParam))
        .then(res => {
          if (res.code === 200) {
            this.page.pageSize = res.body.pageSize
            this.page.totalCount = res.body.totalCount
            this.page.pageNumber = res.body.pageNumber
            this.dataList = res.body.items
          }
          this.isLoading = false
        })
    },
    doExport () {
      const params = {}
      Object.assign(params, this.queryParam)
      params.menuId = this.$route.meta.id // 菜单id
      params.context = this.$route.meta.title + '-D05' // 菜单名称
      params.personId = store.getters.userInfo.personId // 用户id
      params.system = 13 // 系统
      this.isDownloading = true
      exportProjectLevelReimbursementCostDepYear(params).then(res => {
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
        console.log(error)
      })
    },
    loadCostSubjectColumns () {
      getCostSubjectCloumns()
        .then(res => {
          if (res.code === 200) {
            this.costSubjects = res.body
            this.initColumns()
          }
        }).catch(error => {
          console.log(error)
        })
    },
    initColumns () {
      var dynaicColumn = null
      this.costSubjects.forEach(item => {
        dynaicColumn = {
          key: 'COSTTYPE_' + item.id,
          width: 90,
          dataIndex: 'COSTTYPE_' + item.id,
          title: item.costSubject
        }
        this.columns.push(dynaicColumn)
      })
    },
    initParam () {
      var currentYear = moment().year()
      this.endYear = currentYear
      this.queryParam['startYear'] = this.startYear
      this.queryParam['endYear'] = this.endYear
      this.loadCostSubjectColumns()
    },
    getWidthAndHeight () {
      this.cardHeight = window.innerHeight - 125
      this.listScrollHeight = window.innerHeight - 320
    },
    onPageChange (current) {
      this.queryParam.pageNo = current
      this.doQuery()
    }
  },
  created () {
    this.initParam()
    this.getWidthAndHeight()
  },
  watch: {
    startYear (val) {
      this.queryParam['startYear'] = val
    },
    endYear (val) {
      this.queryParam['endYear'] = val
    }
  }
}
</script>

<style scoped>
</style>
