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
      :rowKey="(record) => record.row_id"
      :bordered="false"
      :loading="isLoading"
      :columns="columns"
      :dataSource="dataList"
      :pagination="false"
      :customRow="onClickRow"
      :scroll="{ x: 2860, y: listScrollHeight }"
      :rowClassName="setCurrentRow">
      <template slot="rowIndex" slot-scope="text, record, index">
        <span>
          {{ (page.pageNumber - 1) * page.pageSize + index + 1 }}
        </span>
      </template>
      <template slot="contractAmount" slot-scope="text">
        {{ text | NumberFormat }}
      </template>
      <template slot="contractSoftwareAmount" slot-scope="text">
        {{ text | NumberFormat }}
      </template>
      <template slot="softwareServiceAmount" slot-scope="text">
        {{ text | NumberFormat }}
      </template>
      <template slot="projectAmount" slot-scope="text">
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
import { getProjectLevelBonusDepSubtotal, exportProjectLevelBonusDepSubtotal } from '@/api/projectReport_bonus'
import FooterToolBar from '@/components/FooterToolbar'
import { downFile } from '@/utils/util'
import store from '@/store'

import moment from 'moment/moment'
export default {
  name: 'E04',
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
          key: 'careerGroupText',
          width: 120,
          dataIndex: 'careerGroupText',
          title: '事业群',
          className: 'center-th-header'
        },
        {
          key: 'largeAreaText',
          width: 100,
          dataIndex: 'largeAreaText',
          title: '大区',
          className: 'center-th-header'
        },
        {
          key: 'smallAreaText',
          width: 100,
          dataIndex: 'smallAreaText',
          title: '小区',
          className: 'center-th-header'
        },
        {
          key: 'moneyBackDeptText',
          width: 120,
          dataIndex: 'moneyBackDeptText',
          title: '回款业绩部门',
          className: 'center-th-header'
        },
        {
          key: 'saleDeptText',
          width: 120,
          dataIndex: 'saleDeptText',
          title: '销售业绩部门',
          className: 'center-th-header'
        },
        {
          key: 'customerCode',
          width: 100,
          dataIndex: 'customerCode',
          title: '客户编码',
          align: 'center'
        },
        {
          key: 'customerName',
          width: 200,
          dataIndex: 'customerName',
          title: '客户名称',
          className: 'center-th-header'
        },
        {
          key: 'contractNo',
          width: 100,
          dataIndex: 'contractNo',
          title: '合同编号',
          className: 'center-th-header'
        },
        {
          key: 'contractName',
          width: 200,
          dataIndex: 'contractName',
          title: '合同名称',
          className: 'center-th-header'
        },
        {
          key: 'contractAmount',
          width: 100,
          dataIndex: 'contractAmount',
          title: '合同金额(元)',
          scopedSlots: { customRender: 'contractAmount' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'contractSoftwareAmount',
          width: 140,
          dataIndex: 'contractSoftwareAmount',
          title: '合同软件金额(元)',
          scopedSlots: { customRender: 'contractSoftwareAmount' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'softwareServiceAmount',
          width: 140,
          dataIndex: 'softwareServiceAmount',
          title: '软件与服务金额(元)',
          scopedSlots: { customRender: 'softwareServiceAmount' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'discount',
          width: 70,
          dataIndex: 'discount',
          title: '折扣',
          align: 'center'
        },
        {
          key: 'contractSigningDate',
          width: 120,
          dataIndex: 'contractSigningDate',
          title: '合同签订日期',
          align: 'center'
        },
        {
          key: 'contractAssessmentDate',
          width: 120,
          dataIndex: 'contractAssessmentDate',
          title: '合同考核日期',
          align: 'center'
        },
        {
          key: 'projectId',
          width: 100,
          dataIndex: 'projectId',
          title: '项目ID',
          align: 'center'
        },
        {
          key: 'projectName',
          width: 200,
          dataIndex: 'projectName',
          title: '项目名称',
          className: 'center-th-header'
        },
        {
          key: 'projectAmount',
          width: 100,
          dataIndex: 'projectAmount',
          title: '项目金额(元)',
          scopedSlots: { customRender: 'projectAmount' },
          className: 'center-th-header',
          align: 'right'
        },
        {
          key: 'projectFlagText',
          width: 100,
          dataIndex: 'projectFlagText',
          title: '项目类别',
          align: 'center'
        },
        {
          key: 'projectTypeText',
          width: 100,
          dataIndex: 'projectTypeText',
          title: '项目类型',
          align: 'center'
        },
        {
          key: 'acceptanceStamp',
          width: 100,
          dataIndex: 'acceptanceStamp',
          title: '验收标记',
          align: 'center'
        },
        {
          key: 'depTypeText',
          width: 160,
          dataIndex: 'depTypeText',
          title: '项目奖金产生部门类别',
          align: 'center'
        },
        {
          key: 'projectBonus',
          dataIndex: 'projectBonus',
          title: '项目奖金(元)',
          className: 'center-th-header',
          align: 'right'
        }
      ],
      dataList: [],
      isLoading: false,
      page: { pageNumber: 0, pageSize: 0, totalCount: 0 }
    }
  },
  methods: {
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.row_id
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.row_id === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    doQuery () {
      this.isLoading = true
      getProjectLevelBonusDepSubtotal(this.queryParam)
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
      params.context = this.$route.meta.title + '-E04' // 菜单名称
      params.personId = store.getters.userInfo.personId // 用户id
      params.system = 13 // 系统
      this.isDownloading = true
      exportProjectLevelBonusDepSubtotal(params).then(res => {
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
    initParam () {
      var currentYear = moment().year()
      this.endYear = currentYear
      this.queryParam['startYear'] = this.startYear
      this.queryParam['endYear'] = this.endYear
    },
    getWidthAndHeight () {
      this.cardHeight = window.innerHeight - 125
      this.listScrollHeight = window.innerHeight - 300
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
