<template>
  <div>
    <a-modal
      style="top: 30px"
      :visible="visible"
      :width="firstModalWidth"
      :maskClosable="false"
      :closable="false"
      :bodyStyle="{height: modalHeight}"
      @cancel="firstModalCancel"
      title="提交文档"
      :destroyOnClose="true">
      <a-table
        bordered
        class="docSetTheadClass"
        :loading="isLoading"
        size="small"
        :width="firstModalTableWidth"
        :scroll="{ x: firstModalTableWidth, y: tableHeight - 70 }"
        :rowKey="(record) => record.documentId"
        :columns="firstModalColumns"
        :dataSource="firstModalData"
        :pagination="false"
      >
        <span slot="renderCheck" slot-scope="text, record, index">
<!--          <div v-if="parseInt(text.split(',')[0]) === 1" @click="showFileModal(record,text)" style="text-align: center">√</div>-->
          <div v-if="parseInt(text.split(',')[0]) === 1" style="text-align: center">√</div>
        </span>
        <span slot="renderNumber" slot-scope="text, record, index">
          <div v-if="parseInt(text.split(',')[2]) === 1" @click="showFileModal(record,text)" style="text-align: center;cursor:pointer;">{{parseInt(text.split(',')[0])>0?parseInt(text.split(',')[0]):"-"}}</div>
        </span>
      </a-table>
      <template slot="footer">
        <a-button key="back" @click="firstModalCancel">关闭</a-button>
      </template>
    </a-modal>
    <a-modal
      style="top: 40px"
      :visible="fileModalShow"
      :width="800"
      @cancel="secondModalCancel"
      :maskClosable="false"
      :bodyStyle="{height: '330px'}"
      :destroyOnClose="true">
      <a-spin tip="加载中..." :spinning="loading">

        <div>
          <a-upload :customRequest="handleUpload" :showUploadList="false" :fileList="fileList" :remove="handleRemove" :beforeUpload="beforeUpload">
            <a-button type="primary" :loading="uploading"> <a-icon type="upload" />上传</a-button>
          </a-upload>

          <a-button type="primary" v-if="secondModalInfo.id===null" style="margin-left: 10px">重传</a-button>

          <a-upload v-else :customRequest="handleReUpload" :showUploadList="false" :fileList="fileList" :remove="handleRemove" :beforeUpload="beforeUpload">
            <a-button type="primary" :loading="reUploading" style="margin-left: 10px"> 重传</a-button>
          </a-upload>

          <a-button @click="downloadFile" type="primary" style="margin-left: 10px">查看</a-button>
          <a-button @click="deleteFile" type="primary" style="margin-left: 10px" v-if="deleteShow">删除</a-button>
        </div>
        <a-table
          size="small"
          style="margin-top: 10px"
          :scroll="{ x: false, y: 200 }"
          :rowKey="(record) => record.id"
          :columns="fileColumns"
          :dataSource="detailList"
          :customRow="onSecondClickRow"
          :rowClassName="setSecondCurrentRow"
          :pagination="false"
        >
        <span slot="serial" slot-scope="text, record, index" v-if="modalPage.pageNumber === 0">
          {{ index + 1 }}
        </span>
          <span slot="serial" slot-scope="text, record, index" v-else>
          {{ (modalCurrentPage-1)*modalPage.pageSize +index + 1 }}
        </span>
          <span slot="renderFileSize" slot-scope="text, record, index">
          {{ text }}Mb
        </span>
        </a-table>
      </a-spin>

      <template slot="footer">
          <a-pagination
            :total="modalPage.totalCount"
            :pageSize.sync="modalPage.pageSize"
            v-model="modalPage.pageNumber"
            @change="onModalChange"
            style="margin-bottom: 10px"/>
        </template>
    </a-modal>



  </div>

</template>

<script>
  import { milepostPlanFinished,loadProjectWordList, loadProjectWordDetails, fileUpload, fileDownload, fileDelete, loadStageDocument, loadStageDocumentHeader} from '@/api/project'
  import { loadStageDocumentHeaderWithPlan,loadStageDocumentWithPlan } from '@/api/projectPlan'
  import STable from '@/components/Table'

  const fileColumns = [
    {
      title: '序号',
      scopedSlots: { customRender: 'serial' },
      width: '8%'
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      width: '45%'
    },
    {
      title: '上传时间',
      dataIndex: 'submitDate',
      width: '20%'
    },
    {
      title: '上传人员',
      dataIndex: 'submitterText',
      width: '15%'
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      width: '12%',
      scopedSlots: { customRender: 'renderFileSize' }
    }
  ]

  export default {
    name: 'ProjectLogFile',
    components: {
      STable
    },
    props: {
      selectItem: {
        type: Object,
        required: true
      },
      show: {
        type: Boolean,
        required: false
      },
      projectInfo: {
        type: Object,
        required: true
      },
      uploadTypes: {
        type: Array,
        required: true
      },
      modalHeight: {
        type: String,
        required: true
      },
      tableHeight: {
        type: Number,
        required: true
      },
      planFlag: {
        type: Boolean,
        required: false
      },
      dutyMilepostId:{
        type: Number,
        required: false
      }
    },
    computed:{
      firstModalWidth : function () {
        return this.tableWidth < 1300 ? this.tableWidth+68 :1300
      },
      firstModalTableWidth : function () {
        return this.tableWidth > 1300 ? 1300: this.tableWidth+'px'
      }
    },
    data () {
      return {
        loading:false,
        tableWidth:1000,
        isLoading: false,
        firstModalData:[],
        visible: false,
        firstModalColumns:[],
        fileModalShow:false,
        modalPage: { pageNumber: 1, pageSize: 25, totalCount: 1 },
        uploading: false,
        reUploading: false,
        secondModalInfo: { id: null },
        secondSelectedRow: '',
        uploadType: '',
        fileColumns,
        detailList: [],
        modalCurrentPage: 1,
        fileList: [],
        modalPageNo: { pageNo: 0 ,pageSize: 25},
        firstModalInfo: {},
        deleteShow: false,
      }
    },
    methods: {
      initPage () {
        this.visible = true
        this.firstModalData = []
        this.loadHeader()
        this.loadFirstModalData()
      },
      initHeader(res){
        let width = 0
        let header = []
        const milepostHeader = {
          title: '里程碑名称',
          children: []
        }
        for (let i = 0; i < res.body.length; i++) {
          const column = {
            title: res.body[i].title,
            dataIndex: res.body[i].column,
            align: i === 1 ? 'left' : 'center',
            className: 'center-th-header'
          }
          column.fixed = res.body[i].fixed
          /*if(res.body[i].column === "documentName"){
            column.ellipsis: true, = true
          }*/
          if(res.body[i].colSpan !== null){
            column.colSpan = res.body[i].colSpan
          }
          if(res.body[i].column.indexOf("milepost")===0){
            column.scopedSlots = { customRender: 'renderCheck' }
          }else if(res.body[i].column.indexOf("wordsNumber")===0){
            column.scopedSlots = { customRender: 'renderNumber' }
          }
          if(res.body[i].width !== null){
            column.width = res.body[i].width
            width += res.body[i].width
          }

          if(res.body[i].rowSpan !== null){
            column.customRender = (value, row, index) => {
              const obj = {
                children: value,
                attrs: {},
              };
              let sum = 0
              for(let j = 0 ; j < res.body[i].rowSpan.length; j++){
                let count = res.body[i].rowSpan[j]
                for(let k = 0; k < count; k++){
                  if(index === sum){
                    obj.attrs.rowSpan = count
                  }else if(index === (sum + k)){
                    obj.attrs.rowSpan = 0
                  }
                }
                sum += count
              }
              return obj;
            }
          }
          if (i < 2) {
            header.push(column)
          } else {
            milepostHeader.children.push(column)
          }
        }
        header.push(milepostHeader)

        this.tableWidth = width - 24
        this.firstModalColumns = header
      },
      loadHeader () {
        let modalQueryParam = { 'contractNo': this.projectInfo.contractId}
        const me = this
        if(this.planFlag){
          modalQueryParam.dutyMilepostId = this.dutyMilepostId
          loadStageDocumentHeaderWithPlan(modalQueryParam)
            .then(res => {
              if(res.code === 200){
                me.initHeader(res)
              }
            })
        }else{
          loadStageDocumentHeader(modalQueryParam)
            .then(res => {
              if(res.code === 200){
                me.initHeader(res)
              }
            })
        }

      },
      loadFirstModalData () {
        const me = this
        me.isLoading = true
        let modalQueryParam = { 'contractNo': this.projectInfo.contractId,'projectId':this.projectInfo.projectId}
        if(this.planFlag){
          modalQueryParam.dutyMilepostId = this.dutyMilepostId
          loadStageDocumentWithPlan(modalQueryParam)
            .then(res => {
              if(res.code === 200){
                me.firstModalData = res.body
              }
              me.isLoading = false
            })
        }else{
          loadStageDocument(modalQueryParam)
            .then(res => {
              if(res.code === 200){
                me.firstModalData = res.body
              }
              me.isLoading = false
            })
        }
      },
      firstModalCancel(e) {
        this.visible = false;
      },
      showFileModal (record, text){
        const me = this
        me.firstModalInfo = record
        me.firstModalInfo.milepostId = parseInt(text.split(',')[1])
        me.fileModalShow = true
        me.secondModalInfo = { id: null }
        me.secondSelectedRow = ''
        me.modalPageNo.pageNo = 0
        me.modalPageNo.pageSize = 25
        me.loadDetailList()
      },
      secondModalCancel () {
        this.fileModalShow = false
        this.secondModalInfo = { id: null }
        this.secondSelectedRow = ''
        this.modalPage.pageNumber = 1
        this.modalPage.totalCount = 1
        this.modalCurrentPage = 1
      },
      onSecondClickRow (record) {
        const me = this
        return {
          on: {
            click: () => {
              me.secondSelectedRow = record.id
              me.secondModalInfo = record
            },
            dblclick: () => {
              me.secondSelectedRow = record.id
              me.secondModalInfo = record
            }
          }
        }
      },
      loadDetailList () {
        this.loading = true
        const me = this
        let param = {contractId:this.projectInfo.contractId,dutyId:this.firstModalInfo.milepostId}
        if(!this.planFlag){
          milepostPlanFinished(param).then(res => {
            if(res.code === 200){
              this.deleteShow = !res.body
            }
          })
        }else{
          this.deleteShow = true
        }
        const modalQueryParam = { 'id': this.firstModalInfo.recordId ,'milepostId': this.firstModalInfo.milepostId}
        loadProjectWordDetails(Object.assign( modalQueryParam, this.modalPageNo))
          .then(res => {
            if (res.code === 200) {
              me.modalPage.pageNumber = res.body.pageNumber + 1
              me.modalPage.pageSize = res.body.pageSize
              me.modalPage.totalCount = res.body.totalCount
              me.modalCurrentPage = res.body.pageNumber + 1
              me.detailList = res.body.items
            }
            me.loading = false
          })
      },
      setSecondCurrentRow (record, index) {
        let styleClassName = ''
        if (record.id === this.secondSelectedRow) {
          styleClassName = 'clickRowStyle'
        }
        return styleClassName
      },
      beforeUpload (file) {
        const isLt5M = file.size / 1024 / 1024 < 5
        const suffix = file.name.substr(file.name.lastIndexOf('.') + 1)
        const index = this.uploadTypes.findIndex(obj => obj.name === suffix)
        if (!isLt5M) {
          this.$message.error('单个文件不超过5M!')
          return false
        } else if (index === -1) {
          this.$message.error('文件格式不对!')
          return false
        } else {
          this.fileList = [file]
          return true
        }
        // this.fileList = [...this.fileList, file];
      },
      handleUpload () {
        this.uploading = true
        this.loading = true
        const { fileList } = this
        const formData = new FormData()
        fileList.forEach(file => {
          // formData.append('files[]', file);
          formData.append('file', file)
        })
        formData.append('fileKey', this.firstModalInfo.recordId)
        formData.append('contractId', this.firstModalInfo.contractNo)
        formData.append('id', '')
        formData.append('detailId', '')
        formData.append("milepostId", this.firstModalInfo.milepostId)
        const me = this
        fileUpload(formData).then(res => {
          if (res.code === 200) {
            me.loadDetailList()
            me.loadFirstModalData()
          }
          me.uploading = false
          me.loading = false
        })
      },
      handleReUpload () {
        if (this.secondModalInfo.id === null) {
          this.$message.error(`请选择一条记录`)
          return
        }
        this.loading = true
        this.reUploading = true
        const { fileList } = this
        const formData = new FormData()
        fileList.forEach(file => {
          formData.append('file', file)
        })
        formData.append('fileKey', this.firstModalInfo.recordId)
        formData.append('contractId', this.firstModalInfo.contractNo)
        formData.append('id', this.secondModalInfo.id)
        formData.append('detailId', this.secondModalInfo.detailId)
        formData.append("milepostId", this.firstModalInfo.milepostId)
        const me = this
        fileUpload(formData).then(res => {
          if (res.code === 200) {
            me.loadDetailList()
            me.loadFirstModalData()
          }
          me.reUploading = false
          me.loading = false
        })
      },
      onModalChange (current) {
        this.modalPageNo.pageNo = current - 1 > 0 ? current - 1 : 0
        this.loadDetailList()
      },
      downloadFile () {
        if (this.secondModalInfo.id === null) {
          this.$message.error('未选择文档')
          return
        }
        const param = { 'htbh': this.firstModalInfo.contractNo, 'detailId': this.secondModalInfo.detailId }
        fileDownload(param).then(res => {
          const headers = res.headers
          const contentType = headers['content-type']
          if (res.data) {
            const blob = new Blob([res.data], { type: contentType })
            const contentDisposition = res.headers['content-disposition']
            let fileName = 'unknown'
            if (contentDisposition) {
              fileName = window.decodeURI(res.headers['content-disposition'].split('=')[1])
            }
            this.downFile(blob, fileName)
          }
        })
      },
      downFile (blob, fileName) {
        // 非IE下载
        if ('download' in document.createElement('a')) {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob) // 创建下载的链接
          link.download = fileName // 下载后文件名
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click() // 点击下载
          window.URL.revokeObjectURL(link.href) // 释放掉blob对象
          document.body.removeChild(link) // 下载完成移除元素
        } else {
          // IE10+下载
          window.navigator.msSaveBlob(blob, fileName)
        }
      },
      deleteFile () {
        if (this.secondModalInfo.id === null) {
          this.$message.error('未选择文档')
          return
        }
        if (this.secondModalInfo.deptflag === 1 || this.secondModalInfo.regionflag === 1 || this.secondModalInfo.leaderflag === 1) {
          this.$message.error('该文件已审核无法删除！')
          return
        }
        const me = this
        this.$confirm({
          title: '是否确认删除该文档?',
          // 确认 与 关闭位置对调
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
            me.loading = true
            const param = { 'htbh': me.firstModalInfo.contractNo, 'detailId': me.secondModalInfo.detailId, 'id': me.secondModalInfo.id }
            fileDelete(param).then(res => {
              if (res.code === 200) {
                me.$message.success('删除成功')
                me.secondModalInfo = { id: null }
                me.loadDetailList()
                me.loadFirstModalData()
              }
              me.loading = false
            })
          }
        })
      },
      handleRemove (file) {
        const index = this.fileList.indexOf(file)
        const newFileList = this.fileList.slice()
        newFileList.splice(index, 1)
        this.fileList = newFileList
      },
    }
  }
</script>

<style lang="less" scoped>
  .clickRowStyle {
    background-color: #00b4ed;
  }
  .docSetTheadClass /deep/ .ant-table-small > .ant-table-content .ant-table-header {
    background-color: #FAFAFA;
    border-radius: 4px 4px 0 0;
  }
  .docSetTheadClass /deep/ .ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-header > table {
    background-color: #FAFAFA;
    border-radius: 4px 4px 0 0;
  }
</style>
