<template>
  <a-card :bordered="false" :body-style="{ height:cardHeight + 'px', padding:'10px 0px 0px 10px', overflowY: 'hidden'}">
    <a-row>
      <a-col :span="8">
        <a-card :body-style="{ height:leftPanelHeight + 'px', padding:'0 0'}">
          <a-table
            size="small"
            :loading="isRegionLoading"
            :rowKey="(record) => record.contractNo"
            :columns="regionColumns"
            :dataSource="regionList"
            :customRow="onRegionClickRow"
            :rowClassName="setRegionCurrentRow"
            :pagination="false"
            :scroll="{ x: false, y: listRegionScrollHeight }"
          >
            <template slot="contractName" slot-scope="text, record">
              <span>{{ text }}({{ record.contractCode }})</span>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card :bordered="false" :body-style="{ height:rightPanelHeight + 'px', padding:'0 0'}">
          <a-table
            size="small"
            :bordered="false"
            :loading="isMilepostLoading"
            :columns="milepostColumns"
            :dataSource="milepostList"
            :rowKey="(record) => record.id"
            :customRow="onMilepostClickRow"
            :pagination="milepostPagination"
            @change="handleMilepostCurrentPageChange"
            :rowClassName="setMilepostCurrentRow"
            :scroll="{ x: false, y: listMilepostScrollHeight }">
            <template slot="rowIndex" slot-scope="text, record, index">
              <span>
                {{ (milepostCurrentPage - 1) * milepostPagination.pageSize + index + 1 }}
              </span>
            </template>
            <template slot="name" slot-scope="text, record">
              <template v-if="record.isNew || !readOnly">
                <a-textarea :auto-size="{ minRows: 1 }" v-model="record.name" @change="milepostNameChange" :maxLength="50"/>
              </template>
              <template v-else>
                {{ text }}
              </template>
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
                  style="width: 100px"
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
            <template slot="wordsNum" slot-scope="text">
              <div class="hoverClass" style="cursor:pointer">{{ text }}</div>
            </template>
            <template slot="operate" slot-scope="text, record">
              <a-icon type="delete" theme="twoTone" style="font-size:15px" @click="doRemoveMilepost(record)" v-if="record.id === rowMilepostSelected"/>
            </template>
            <template slot="footer" v-if="rowRegionSelected">
              <a-row>
                <a-col style="text-align: center">
                  <a-button type="link" icon="plus" v-if="!readOnly" style="margin: 10px 0px" @click="doCreateMilepost">新增</a-button>
                </a-col>
              </a-row>
              <a-row style="margin-bottom: 10px;background: #FAFAFA;padding: 10px 0px" v-if="milepostList.length > 0">
                <a-col :span="13"></a-col>
                <a-col :span="6">
                  <div style="text-align: left;margin-left: 29px;margin-top: 5px">合计：<span :style="error?{color: 'red'}:{}">{{ totalWeight | PercentFormat }}</span></div>
                </a-col>
                <a-col :span="5">
                  <a-button
                    @click="doSetDocument"
                    :disabled="docSetBtnDisabled"
                    type="primary">{{ this.docBtnName }}
                  </a-button>
                </a-col>
              </a-row>
            </template>
          </a-table>
          <a-modal
            title="文档要求"
            style="top: 30px;"
            v-model="docUploadModalVisible"
            :width="700"
            :maskClosable="false"
            :bodyStyle="{height: docUploadModalHeight + 'px'}"
            :closable="false"
            :destroyOnClose="true">
            <a-table
              bordered
              :loading="isMilepostDocLoading"
              size="small"
              class="docSetTheadClass"
              :rowKey="(record) => record.documentId"
              :scroll="{ x: false, y: docSetTableHeight + 50 }"
              :columns="docUploadModalColumns"
              :dataSource="docUploadModalData"
              :pagination="false"
            >
              <template slot="milepost" slot-scope="text">
                <a-checkbox :checked="text"/>
              </template>
            </a-table>
            <template slot="footer">
              <a-button key="submit" type="primary" @click="onDocModalConfirm" v-if="!readOnly">确定</a-button>
              <a-button key="back" @click="onDocModalCancel" v-if="!readOnly">取消</a-button>
              <a-button key="back" @click="onDocModalCancel" v-if="readOnly">关闭</a-button>
            </template>
          </a-modal>
          <a-modal
            :title="docBtnName"
            style="top: 10px;"
            :visible="docSetModalVisible"
            :width="firstModalWidth"
            :maskClosable="false"
            :closable="false"
            :bodyStyle="{height: docSetModalHeight + 'px'}"
            :destroyOnClose="true">
            <a-table
              bordered
              :loading="isDocSettingLoading"
              size="small"
              class="docSetTheadClass"
              :width="firstModalTableWidth"
              :scroll="{ x: firstModalTableWidth, y: docSetTableHeight }"
              :rowKey="(record) => record.documentId"
              :columns="docSetModalColumns"
              :dataSource="docSetModalData"
              :pagination="false"
            >
              <template slot="renderCheck" slot-scope="text">
                <a-checkbox :checked="text"/>
              </template>
            </a-table>
            <template slot="footer">
              <a-button v-if="!readOnly" key="submit" type="primary" @click="onDocSetModalConfirm" :loading="docSetLoading">确定</a-button>
              <a-button v-if="!readOnly" key="back" @click="onDocSetModalCancel">取消</a-button>
              <a-button v-if="readOnly" key="back" @click="onDocSetModalCancel">关闭</a-button>
            </template>
          </a-modal>
          <a-alert
            closable
            v-if="alertData.isAlert"
            @close="onAlertClose"
            :type="alertData.alertType"
            style="position: absolute;bottom: 60px;margin-left:50px;width: 500px;text-align: center"
            showIcon
            :message="alertData.alertMsg"/>
        </a-card>
      </a-col>
    </a-row>

  </a-card>
</template>

<script>
import { STable } from '@/components'
import { loadProjectDutyMilepost, loadProjectRegionList, doSaveProjectDutyMilepost, loadStageDocumentHeader, loadStageDocument } from '@/api/projectDutyMaintain'
import { Decimal } from 'decimal.js'

const regionColumns = [
  {
    dataIndex: 'contractName',
    width: '100%',
    title: '合同名称',
    scopedSlots: { customRender: 'contractName' }
  }]
export default {
  name: 'MilepostSetting',
  components: {
    STable
  },
  data () {
    return {
      rowRegionSelected: '',
      rowMilepostSelected: '',
      rowMilepostSelectedInfo: {},
      cardHeight: window.innerHeight - 60,
      tableWidth: 1000,
      docUploadModalHeight: window.innerHeight - 190,
      docSetModalHeight: window.innerHeight - 190,
      milepostPagination: {
        total: 0,
        size: 'small',
        current: 0,
        pageSize: 0
      },
      milepostQueryParam: { pageNo: 1, pageSize: 25, contractNo: null, dutyId: null },
      regionColumns,
      milepostColumns: [{
        dataIndex: 'rowIndex',
        title: '序号',
        width: '10%',
        scopedSlots: { customRender: 'rowIndex' },
        align: 'center'
      },
      {
        dataIndex: 'name',
        width: '50%',
        title: '里程碑名称',
        scopedSlots: { customRender: 'name' }
      },
      {
        dataIndex: 'weight',
        width: '20%',
        title: '权重',
        scopedSlots: { customRender: 'weight' }
      },
      {
        dataIndex: 'wordsNum',
        width: '15%',
        title: '文档要求',
        scopedSlots: { customRender: 'wordsNum' },
        customCell: (record, rowindex) => {
          return {
            on: {
              click: () => {
                if (record.name) {
                  this.rowMilepostSelected = record.id
                  this.rowMilepostSelectedInfo = record
                  this.docUploadModalVisible = true
                  this.isMilepostDocLoading = true
                  this.loadSingleMilepostHeader(record.name)
                  this.loadFirstModalData(1)
                }
              }
            }
          }
        },
        align: 'center'
      },
      {
        dataIndex: 'operate',
        width: '5%',
        title: '',
        scopedSlots: { customRender: 'operate' }
      }],
      leftPanelHeight: window.innerHeight - 65,
      rightPanelHeight: window.innerHeight - 70,
      docSetTableHeight: window.innerHeight - 380,
      listRegionScrollHeight: window.innerHeight - 110,
      listMilepostScrollHeight: window.innerHeight - 360,
      isRegionLoading: false,
      isMilepostLoading: false,
      isMilepostDocLoading: false,
      isDocSettingLoading: false,
      docSetLoading: false,
      docSetBtnDisabled: false,
      savebtnStatus: false,
      regionList: [],
      milepostList: [],
      milepostCurrentPage: 1,
      countNumber: 0,
      readOnly: false,
      docUploadModalVisible: false,
      docSetModalVisible: false,
      docSetModalColumns: [],
      docUploadModalColumns: [],
      docUploadModalData: [],
      docSetModalData: [],
      selectedDocId: [],
      milepostColumn: {
        dataIndex: 'milepost',
        title: null,
        width: 230,
        scopedSlots: { customRender: 'milepost' },
        align: 'center',
        customCell: (record, rowindex) => {
          return {
            on: {
              click: () => {
                if (this.readOnly) {
                  return
                }
                this.alertData.isAlert = false
                const newData = [...this.docUploadModalData]
                var target = newData.find(item => record.documentId === item.documentId)
                if (target) {
                  target.milepost = !target.milepost
                  if (this.selectedDocId.includes(target.documentId)) {
                    this.selectedDocId = this.selectedDocId.filter(item => item !== target.documentId)
                  } else {
                    this.selectedDocId.push(target.documentId)
                  }
                }
                this.docUploadModalData = newData
                this.infoTabPane.hasChanged = true
              }
            }
          }
        }
      },
      deleteMileposts: [],
      error: false,
      docBtnName: ''
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
    alertData: {
      type: Object,
      default: null
    },
    dutyRegions: {
      type: Array,
      default: () => []
    },
    btnStatus: {
      type: Object,
      default: null
    }
  },
  computed: {
    firstModalWidth: function () {
      return this.tableWidth < 1300 ? this.tableWidth + 68 : 1300
    },
    firstModalTableWidth: function () {
      return this.tableWidth > 1300 ? 1300 : this.tableWidth + 'px'
    },
    totalWeight: function () {
      return this.calculateTotalWeight()
    }
  },
  methods: {
    loadHeader () {
      this.docSetModalColumns = []
      this.docSetModalData = []
      const modalQueryParam = { contractNo: this.rowRegionSelected, dutyId: this.dutyId }
      const me = this
      loadStageDocumentHeader(modalQueryParam)
        .then(res => {
          if (res.code === 200) {
            const header = []
            const milepostHeader = {
              title: '里程碑名称',
              children: []
            }
            let width = 0
            for (let i = 0; i < res.body.length; i++) {
              const column = {
                title: res.body[i].title,
                dataIndex: res.body[i].column,
                align: i === 1 ? 'left' : 'center',
                className: 'center-th-header'
              }
              column.fixed = res.body[i].fixed
              /* if(res.body[i].column === "documentName"){
                  column.ellipsis: true, = true
                } */
              if (res.body[i].colSpan !== null) {
                column.colSpan = res.body[i].colSpan
              }
              if (res.body[i].column.indexOf('milepost_') === 0) {
                column.scopedSlots = { customRender: 'renderCheck' }
                column.customCell = function (record, rowindex) {
                  return {
                    on: {
                      click: () => {
                        if (me.readOnly) {
                          return
                        }
                        me.alertData.isAlert = false
                        const newData = [...me.docSetModalData]
                        const milepostList = [...me.milepostList]
                        var target = newData.find(item => record.documentId === item.documentId)
                        if (target) {
                          target[res.body[i].column] = !target[res.body[i].column]
                          var milepostid = Number(res.body[i].column.split('_')[1])
                          var milepost = milepostList.find(item => item.id === milepostid)
                          if (milepost.wordsList.includes(record.documentId)) {
                            milepost.wordsList = milepost.wordsList.filter(item => item !== record.documentId)
                          } else {
                            milepost.wordsList.push(record.documentId)
                          }
                        }
                        me.docSetModalData = newData
                        me.infoTabPane.hasChanged = true
                      }
                    }
                  }
                }
              }
              if (res.body[i].width !== null) {
                column.width = res.body[i].width
                width += res.body[i].width
              }
              if (res.body[i].rowSpan !== null) {
                column.customRender = (value, row, index) => {
                  const obj = {
                    children: value,
                    attrs: {}
                  }
                  let sum = 0
                  for (let j = 0; j < res.body[i].rowSpan.length; j++) {
                    const count = res.body[i].rowSpan[j]
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
              if (i < 2) {
                header.push(column)
              } else {
                milepostHeader.children.push(column)
              }
            }
            header.push(milepostHeader)
            this.docSetModalColumns = header
            me.tableWidth = width - 24
          }
        })
    },
    loadSingleMilepostHeader (milepostName) {
      this.docUploadModalColumns = []
      this.docUploadModalData = []
      const modalQueryParam = { contractNo: this.rowRegionSelected, dutyId: this.dutyId }
      loadStageDocumentHeader(modalQueryParam)
        .then(res => {
          if (res.code === 200) {
            const header = []
            const milepostHeader = {
              title: '里程碑名称',
              children: []
            }
            let width = 0
            var finxedHeader = res.body.slice(0, 2)
            for (let i = 0; i < finxedHeader.length; i++) {
              const column = {
                title: res.body[i].title,
                dataIndex: res.body[i].column,
                align: i === 1 ? 'left' : 'center',
                className: 'center-th-header'
              }
              if (res.body[i].colSpan !== null) {
                column.colSpan = res.body[i].colSpan
              }
              if (res.body[i].width !== null) {
                column.width = res.body[i].width
                width += res.body[i].width
              }
              if (res.body[i].rowSpan !== null) {
                column.customRender = (value, row, index) => {
                  const obj = {
                    children: value,
                    attrs: {}
                  }
                  let sum = 0
                  for (let j = 0; j < res.body[i].rowSpan.length; j++) {
                    const count = res.body[i].rowSpan[j]
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
            }
            this.milepostColumn.title = milepostName
            milepostHeader.children.push(this.milepostColumn)
            header.push(milepostHeader)
            this.docUploadModalColumns = [...header]
            this.tableWidth = width - 24
          }
        })
    },
    loadFirstModalData (index) {
      const me = this
      const modalQueryParam = { contractNo: this.rowRegionSelected, dutyId: this.dutyId }
      loadStageDocument(modalQueryParam)
        .then(res => {
          if (res.code === 200) {
            if (index === 1) { // 需上传文档数据
              this.docUploadModalData = res.body
              this.selectedDocId = []
              if (this.rowMilepostSelectedInfo.words) {
                this.selectedDocId = this.rowMilepostSelectedInfo.words.split(',').map(Number)
              }
              this.docUploadModalData.forEach(item => {
                if (this.selectedDocId.includes(item.documentId)) {
                  item.milepost = true
                }
              })
            }
            if (index === 2) {
              this.docSetModalData = res.body // 文档设置数据
            }
          }
          if (index === 1) {
            me.isMilepostDocLoading = false
          }
          if (index === 2) {
            me.isDocSettingLoading = false
          }
        })
    },
    doCreateMilepost () {
      if (this.btnStatus.savebtnStatus || this.btnStatus.commitbtnStatus) {
        return
      }
      if (this.isWeightErrorAlert) {
        this.isWeightErrorAlert = false
      }
      if (this.alertData.isAlert) {
        this.alertData.isAlert = false
      }
      this.countNumber = this.countNumber - 1
      this.milepostList.push({
        id: this.countNumber,
        dutyId: this.dutyId,
        contractNo: this.rowRegionSelected,
        name: null,
        wordsNum: 0,
        words: '',
        weight: null,
        isNew: true
      })
      this.infoTabPane.hasChanged = true
      var target = this.regionList.find(item => this.rowRegionSelected === item.contractNo)
      target.mileposts = [...this.milepostList]
    },
    doRemoveMilepost (record) {
      this.rowMilepostSelected = record.id
      this.rowMilepostSelectedInfo = record
      if (this.btnStatus.savebtnStatus || this.btnStatus.commitbtnStatus) {
        return
      }
      if (this.alertData.isAlert) {
        this.alertData.isAlert = false
      }
      const me = this
      this.$confirm({
        title: '是否删除该行记录？',
        cancelText: '取消',
        onCancel () {
        },
        okText: '确认',
        onOk () {
          if (me.rowMilepostSelectedInfo.selectedFlag === 1) {
            me.alertData.alertType = 'error'
            me.alertData.alertMsg = '该里程碑已在项目计划中应用并已完结，无法删除！'
            me.alertData.isAlert = true
            return
          }
          if (me.rowMilepostSelected > 0) {
            me.deleteMileposts.push(me.rowMilepostSelected)
          }
          me.milepostList = me.milepostList.filter(item => item.id !== me.rowMilepostSelected)
          me.rowMilepostSelected = ''
          var target = me.regionList.find(item => me.rowRegionSelected === item.contractNo)
          target.mileposts = [...me.milepostList]
        }
      })
      this.infoTabPane.hasChanged = true
    },
    handleSaveMileposts (op) {
      if (this.error) {
        return
      }
      this.isWeightErrorAlert = false
      var target = this.regionList.find(item => item.contractNo === this.rowRegionSelected)
      target.mileposts = [...this.milepostList]
      var milepostList = []
      if (this.regionList.length > 0) {
        for (var i = 0; i < this.regionList.length; i++) {
          if (this.regionList[i].mileposts) {
            var milepost = [...this.regionList[i].mileposts]
            for (var j = 0; j < milepost.length; j++) {
              if (!milepost[j].name) {
                this.alertData.alertMsg = '合同号：' + this.regionList[i].contractCode + '-请确保设置里程碑名字!'
                this.alertData.alertType = 'error'
                this.alertData.isAlert = true
                this.btnStatus.savebtnStatus = false
                return
              }
              if (!milepost[j].weight) {
                this.alertData.alertMsg = '合同号：' + this.regionList[i].contractCode + '-请先设置权重!'
                this.alertData.alertType = 'error'
                this.alertData.isAlert = true
                this.btnStatus.savebtnStatus = false
                return
              }
              milepostList.push(milepost[j])
            }
          }
        }
      }

      const params = { saves: milepostList, deletes: this.deleteMileposts }
      doSaveProjectDutyMilepost(params)
        .then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.infoTabPane.hasChanged = false
            this.deleteMileposts = []
            this.loadProjectRegionList()
            if (op === 'docSet') {
              this.docSetModalVisible = true
              this.isDocSettingLoading = true
              this.docSetLoading = false
              this.loadHeader()
              this.$nextTick(() => {
                this.loadFirstModalData(2)
              }, 300)
            }
          }
          this.btnStatus.savebtnStatus = false
        })
    },
    doSetDocument () {
      if (this.btnStatus.savebtnStatus || this.btnStatus.commitbtnStatus) {
        return
      }
      if (this.isWeightErrorAlert) {
        this.isWeightErrorAlert = false
      }
      if (this.alertData.isAlert) {
        this.alertData.isAlert = false
      }
      const me = this
      for (var i = 0; i < this.milepostList.length; i++) {
        if (this.milepostList[i].id < 0 || this.deleteMileposts.length > 0 || this.infoTabPane.hasChanged) {
          this.$confirm({
            title: '里程碑设置数据已修改，是否先保存数据',
            cancelText: '是',
            okText: '否',
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
              me.handleSaveMileposts('docSet')
            }
          })
          return
        }
        if (i === this.milepostList.length - 1) {
          this.docSetModalVisible = true
          this.isDocSettingLoading = true
          this.docSetLoading = false
          this.loadHeader()
          this.$nextTick(() => {
            this.loadFirstModalData(2)
          }, 300)
        }
      }
    },
    validateMilepost () {
      var milepostList = []
      if (this.regionList.length > 0) {
        for (var i = 0; i < this.regionList.length; i++) {
          if (this.regionList[i].mileposts && this.regionList[i].mileposts.length > 0) {
            var milepost = [...this.regionList[i].mileposts]
            for (var j = 0; j < milepost.length; j++) {
              if (!milepost[j].name) {
                this.alertData.alertMsg = '合同号：' + this.regionList[i].contractCode + '-请确保设置里程碑名字!'
                this.alertData.alertType = 'error'
                this.alertData.isAlert = true
                this.btnStatus.commitbtnStatus = false
                return false
              }
              if (milepost[j].wordsNum === 0) {
                this.alertData.alertMsg = '合同号：' + this.regionList[i].contractCode + '-请先设置文档要求!'
                this.alertData.alertType = 'error'
                this.alertData.isAlert = true
                this.btnStatus.commitbtnStatus = false
                return false
              }
              if (!milepost[j].weight) {
                this.alertData.alertMsg = '合同号：' + this.regionList[i].contractCode + '-请先设置权重!'
                this.alertData.alertType = 'error'
                this.alertData.isAlert = true
                this.btnStatus.commitbtnStatus = false
                return false
              }
              if (this.totalWeight < 1) {
                this.alertData.alertMsg = '合同号：' + this.regionList[i].contractCode + '-权重之和不为100%，请重新设置!'
                this.alertData.alertType = 'error'
                this.alertData.isAlert = true
                this.btnStatus.commitbtnStatus = false
                return false
              }
              milepostList.push(milepost[j])
            }
          } else {
            this.alertData.alertMsg = '请在里程碑设置中设置并保存每个合同相对应的里程碑!'
            this.alertData.alertType = 'warning'
            this.alertData.isAlert = true
            this.btnStatus.commitbtnStatus = false
            return false
          }
        }
      }
      const params = { saves: milepostList, deletes: this.deleteMileposts }
      doSaveProjectDutyMilepost(params)
        .then(res => {
          if (res.code === 200) {
            this.infoTabPane.hasChanged = false
            this.deleteMileposts = []
            this.loadProjectRegionList()
          }
        })
      return true
    },
    onRegionClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.alertData.isAlert = false
            var target = this.regionList.find(item => this.milepostQueryParam.contractNo === item.contractNo)
            target.mileposts = [...this.milepostList]
            this.rowRegionSelected = record.contractNo
            this.rowMilepostSelected = ''
            this.milepostQueryParam.contractNo = this.rowRegionSelected
            this.milepostQueryParam.dutyId = this.dutyId
            target = this.regionList.find(item => this.rowRegionSelected === item.contractNo)
            if (target.mileposts) {
              this.milepostList = [...target.mileposts]
              if (this.milepostList.length > 0) {
                this.docSetBtnDisabled = false
              } else {
                this.docSetBtnDisabled = true
              }
            } else {
              this.loadProjectMilepostList()
            }
          }
        }
      }
    },
    setRegionCurrentRow (record, index) {
      var styleClassName = ''
      if (record.contractNo === this.rowRegionSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    onMilepostClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.alertData.isAlert = false
            this.rowMilepostSelected = record.id
            this.rowMilepostSelectedInfo = record
          }
        }
      }
    },
    setMilepostCurrentRow (record, index) {
      var styleClassName = ''
      if (record.id === this.rowMilepostSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    milepostNameChange (val) {
      this.infoTabPane.hasChanged = true
      this.alertData.isAlert = false
    },
    loadProjectRegionList () {
      this.isRegionLoading = true
      loadProjectRegionList({ dutyId: this.dutyId })
        .then(res => {
          if (res.code === 200) {
            this.regionList = res.body
            Object.assign(this.dutyRegions, this.regionList)
            if (this.regionList.length > 0) {
              if (this.rowRegionSelected) {
                this.milepostQueryParam.contractNo = this.rowRegionSelected
                this.milepostQueryParam.dutyId = this.dutyId
                this.loadProjectMilepostList()
              } else {
                this.rowRegionSelected = this.regionList[0].contractNo
                this.milepostQueryParam.contractNo = this.rowRegionSelected
                this.milepostQueryParam.dutyId = this.dutyId
                this.loadProjectMilepostList()
              }
            }
          }
          this.isRegionLoading = false
        })
    },
    loadProjectMilepostList () {
      this.isMilepostLoading = true
      loadProjectDutyMilepost(this.milepostQueryParam)
        .then(res => {
          if (res.code === 200) {
            this.milepostPagination.current = res.body.pageNumber + 1
            this.milepostPagination.pageSize = res.body.pageSize
            this.milepostPagination.total = res.body.totalCount
            this.milepostList = res.body.items
            var target = this.regionList.find(item => item.contractNo === this.rowRegionSelected)
            target.mileposts = [...this.milepostList]
            this.milepostCurrentPage = res.body.pageNumber + 1
            if (this.milepostList.length > 0) {
              this.docSetBtnDisabled = false
            } else {
              this.docSetBtnDisabled = true
            }
          }
          this.isMilepostLoading = false
        })
    },
    handleMilepostCurrentPageChange (pagination) {
      this.alertData.isAlert = false
      this.milepostQueryParam.pageNo = pagination.current
      this.loadProjectMilepostList()
    },
    handleWeightFocus (record) {
      this.rowMilepostSelected = record.id
    },
    handleWeightChange (val) {
      this.alertData.isAlert = false
      const newData = [...this.milepostList]
      const target = newData.find(item => this.rowMilepostSelected === item.id)
      if (target) {
        target['weight'] = val
        this.milepostList = newData
      }
      this.infoTabPane.hasChanged = true
    },
    onDocModalConfirm () {
      const newData = [...this.milepostList]
      var target = newData.find(item => item.id === this.rowMilepostSelected)
      if (target) {
        target.wordsNum = this.selectedDocId.length
        target.words = this.selectedDocId.join(',')
        target.wordsList = this.selectedDocId
      }
      this.milepostList = newData
      this.selectedDocId = []
      this.docUploadModalColumns = []
      this.docUploadModalData = []
      this.docUploadModalVisible = false
    },
    onDocModalCancel () {
      this.selectedDocId = []
      this.docUploadModalColumns = []
      this.docUploadModalData = []
      this.docUploadModalVisible = false
    },
    onDocSetModalConfirm () {
      this.milepostList.forEach(item => {
        item.words = item.wordsList.join(',')
        item.wordsNum = item.wordsList.length
      })
      this.docSetModalVisible = false
      this.infoTabPane.hasChanged = true
    },
    onDocSetModalCancel () {
      this.docSetModalVisible = false
      this.docSetModalColumns = []
      this.docSetModalData = []
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    onAlertClose () {
      this.alertData.isAlert = false
    },
    onWeightAlertClose () {
      this.isWeightErrorAlert = false
      this.alertMessage = ''
    },
    calculateTotalWeight () {
      var totalWeight = 0
      const newData = [...this.milepostList]
      if (this.milepostList.length > 0) {
        this.milepostList.forEach(item => {
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
    initPage () {
      this.infoTabPane.key = '2'
      this.loadProjectRegionList()
      if (this.operate === 'read' || this.operate === 'audit') {
        this.readOnly = true
        this.docBtnName = '文档要求查看'
      }
      if (this.operate === 'modify') {
        this.readOnly = false
        this.docBtnName = '文档要求设置'
      }
    }
  },
  mounted () {
    this.initPage()
  }
}
</script>

<style scoped>
  .errorClass {
    border: 1px solid red;
    border-radius: 4px;
  }
  .docSetTheadClass /deep/ .ant-table-small > .ant-table-content .ant-table-header {
    background-color: #FAFAFA;
    border-radius: 4px 4px 0 0;
  }
  .docSetTheadClass /deep/ .ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-header > table {
    background-color: #FAFAFA;
    border-radius: 4px 4px 0 0;
  }
  /deep/.ant-table-footer {
    position: relative;
    padding: 0px;
    color: rgba(0, 0, 0, 0.85);
    background: #ffffff;
    border-top: 1px solid #e8e8e8;
    border-radius: 0 0 4px 4px;
  }
  /deep/ .ant-table-row-cell-last {
    text-align: center;
  }
  div.hoverClass:hover{
    color:#1890FF;
  }
</style>
