<template>
  <a-card :bordered="false" :body-style="{ height:cardHeight + 'px', padding:'10px 0px 0px 10px', overflowY: 'hidden'}">
    <a-table
      size="small"
      :bordered="false"
      :loading="isBackMoneyLoading"
      :columns="backMoneyColumns"
      :dataSource="backMoneyList"
      :rowKey="(record) => record.id"
      :customRow="onBackMoneyClickRow"
      :pagination="false"
      :rowClassName="setBackMoneyCurrentRow"
      @expand="expandRow"
      :expandedRowKeys="expandedRowKeys"
      :scroll="{ x: false, y: listScrollHeight }">
      <template slot="contractCode" slot-scope="text, record">
        <span v-if="record.selectedFlag === -1">{{text}}</span>
      </template>
      <template slot="selectedFlag" slot-scope="text, record">
        <a-checkbox :checked="text === 1" v-if="text !== -1 && record.paymentItem !== 100" @change="handleSelectedFlagChange(record)"/>
      </template>
      <template slot="amount" slot-scope="text">
        <span v-if="text > 0">{{text.toFixed(2) | NumberFormat}}</span>
      </template>
      <template slot="paymentAmount" slot-scope="text">
        <span v-if="text > 0">{{text.toFixed(2) | NumberFormat}}</span>
      </template>
      <template slot="expected" slot-scope="text, record">
        <template v-if="readOnly">
          <template v-if="record.selectedFlag === -1">
            <span style="color: red">{{text.toFixed(2) | NumberFormat}}</span>
          </template>
          <template v-else>
            <span v-if="text > 0">{{text.toFixed(2) | NumberFormat}}</span>
          </template>
        </template>
        <template v-else>
          <template v-if="record.selectedFlag === -1">
            <span style="color: red">{{text.toFixed(2) | NumberFormat}}</span>
          </template>
          <template v-else>
            <a-input-number v-model="record.expected" v-if="record.selectedFlag === 1" @blur="onBackMoneyInputBlur(record)" @focus="onBackMoneyInputFocus(record)" ></a-input-number>
          </template>
          </template>
      </template>
      <template slot="footer" v-if="backMoneyList.length > 0">
        <div style="text-align:right;margin-right: 10px">合计：<span>{{totalAmountValue.toFixed(2) | NumberFormat}}</span></div>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { loadBackMoneyList, doSaveBackMoneyList } from '@/api/projectDutyMaintain'
import { Decimal } from 'decimal.js'

export default {
  name: 'PlanBackMoney',
  data () {
    return {
      isBackMoneyLoading: false,
      savebtnStatus: false,
      readOnly: false,
      backMoneyList: [],
      rowBackMoneySelected: '',
      rowBackMoneySelectedInfo: {},
      cardHeight: window.innerHeight - 60,
      listScrollHeight: window.innerHeight - 250,
      backMoneyColumns: [{
        dataIndex: 'contractCode',
        title: '合同编号',
        width: '14%',
        scopedSlots: { customRender: 'contractCode' }
      }, {
        dataIndex: 'paymentItemText',
        title: '付款款项',
        width: '10%'
      }, {
        dataIndex: 'paymentTypeText',
        title: '付款类型',
        width: '10%'
      }, {
        dataIndex: 'paymentCondition',
        title: '付款条件',
        width: '24%'
      }, {
        dataIndex: 'amount',
        title: '已回金额',
        scopedSlots: { customRender: 'amount' },
        width: '10%'
      }, {
        dataIndex: 'paymentAmount',
        title: '应付金额',
        width: '10%',
        scopedSlots: { customRender: 'paymentAmount' },
        align: 'right'
      }, {
        dataIndex: 'selectedFlag',
        title: '计划回款标记',
        width: '9%',
        align: 'center',
        scopedSlots: { customRender: 'selectedFlag' }
      }, {
        dataIndex: 'expected',
        title: '计划回款(元)',
        scopedSlots: { customRender: 'expected' },
        width: '13%',
        align: 'right'
      }],
      payment: {
        id: null,
        contractNo: null,
        paymentId: null,
        dutyId: null,
        expected: null
      },
      expandedRowKeys: []
    }
  },
  props: {
    dutyId: {
      type: Number,
      default: 0,
      required: true
    },
    operate: {
      type: String,
      default: 'read',
      required: true
    },
    infoTabPane: {
      type: Object,
      default: null
    },
    btnStatus: {
      savebtnStatus: false,
      commitbtnStatus: false
    }
  },
  methods: {
    onBackMoneyClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.rowBackMoneySelected = record.id
            this.rowBackMoneySelectedInfo = record
          }
        }
      }
    },
    setBackMoneyCurrentRow (record, index) {
      var styleClassName = ''
      if (record.id === this.rowBackMoneySelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    expandRow (expanded, record) {
      if (expanded) {
        this.expandedRowKeys.push(record.id)
      } else {
        this.expandedRowKeys = this.expandedRowKeys.filter(key => key !== record.id)
      }
    },
    loadBackMoneyList () {
      this.isBackMoneyLoading = true
      loadBackMoneyList({ dutyId: this.dutyId })
        .then(res => {
          if (res.code === 200) {
            this.backMoneyList = res.body
            this.getExpandKeys()
          }
          this.isBackMoneyLoading = false
        })
    },
    getExpandKeys () {
      if (this.backMoneyList.length > 0) {
        var expandRows = this.backMoneyList.filter(item => item.selectedFlag === -1)
        this.expandedRowKeys = expandRows.map(item => item.id)
      }
    },
    handleSaveProjectDutyPayment () {
      var saveArray = []
      var deletes = []
      this.backMoneyList.forEach(parentItem => {
        if (parentItem.children) {
          parentItem.children.forEach(item => {
            if (item.selectedFlag === 1) { // 计划回款表新增、修改的数据
              saveArray.push(item)
            }
            if (item.selectedFlag === 0 && item.planPaymentId) { // 未选择且计划回款表中存在的数据
              deletes.push(item.planPaymentId)
            }
          })
        }
      })
      var saves = []
      saveArray.forEach(item => {
        this.payment.id = item.planPaymentId
        this.payment.contractNo = item.contractNo
        this.payment.dutyId = item.dutyId
        this.payment.expected = item.expected
        this.payment.paymentId = item.id
        saves.push({ ...this.payment })
      })
      this.isBackMoneyLoading = true
      this.savebtnStatus = true
      const params = { saves: saves, deletes: deletes }
      doSaveBackMoneyList(params)
        .then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功！')
            this.infoTabPane.hasChanged = false
            this.$emit('refresh', this.dutyId)
            this.loadBackMoneyList()
          }
          this.isBackMoneyLoading = false
          this.savebtnStatus = false
        })
    },
    onBackMoneyInputFocus (record) {
      this.rowBackMoneySelected = record.id
      this.rowBackMoneySelectedInfo = record
      if (!record._expected) {
        record._expected = record.expected
      }
    },
    onBackMoneyInputBlur (record) {
      const newData = [...this.backMoneyList]
      var totalBackMoneyRecord = newData.find(item => item.contractNo === record.contractNo && item.selectedFlag === -1) // 计划回款总计数据
      totalBackMoneyRecord.expected = this.evil(totalBackMoneyRecord.children.map(item => item.expected ? item.expected : 0).join('+'))
    },
    evil (fn) {
      var Fn = Function
      return new Fn('return ' + fn)()
    },
    handleSelectedFlagChange (record) {
      if (this.readOnly) {
        return
      }
      const newData = [...this.backMoneyList]
      var totalBackMoneyRecord = newData.find(item => item.contractNo === record.contractNo && item.selectedFlag === -1) // 计划回款总计数据
      this.rowBackMoneySelected = record.id
      this.rowBackMoneySelectedInfo = record
      // record.selectedFlag若为-1,仅用来显示数据的预计回款总和
      if (record.selectedFlag === 0) {
        record.selectedFlag = 1
        record.editable = true
        if (record.planPaymentId) {
          record.expected = record._expected
        } else {
          record.expected = record.paymentAmount
        }
      } else if (record.selectedFlag === 1) {
        record.selectedFlag = 0
        record.editable = false
        if (record.planPaymentId && !record._expected) {
          record._expected = record.expected
        }
        record.expected = null
      }
      totalBackMoneyRecord.expected = this.evil(totalBackMoneyRecord.children.map(item => item.expected ? item.expected : 0).join('+'))
      this.infoTabPane.hasChanged = true
    },
    initPage () {
      this.infoTabPane.key = '3'
      this.loadBackMoneyList()
      if (this.operate === 'read' || this.operate === 'audit') {
        this.readOnly = true
      }
      if (this.operate === 'modify') {
        this.readOnly = false
      }
    }
  },
  mounted () {
    this.initPage()
  },
  computed: {
    totalAmountValue: function () {
      var totalAmount = 0
      const newData = [...this.backMoneyList]
      var targetArry = newData.filter(item => item.selectedFlag === -1)
      targetArry.forEach(item => {
        totalAmount = new Decimal(item.expected).add(new Decimal(totalAmount)).toNumber()
      })
      return totalAmount
    }
  }

}
</script>

<style scoped>
   /deep/ .ant-table-small > .ant-table-content .ant-table-header {
    background-color: #FAFAFA;
    border-radius: 4px 4px 0 0;
  }
   /deep/ .ant-table-tbody > tr {
     -webkit-transition: all 0.3s, height 0s;
     transition: all 0.3s, height 0s;
     height: 50px;
   }
</style>
