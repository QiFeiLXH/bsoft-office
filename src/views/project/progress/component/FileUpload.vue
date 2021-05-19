<template>
  <div>
    <a-modal :title="modelTitle"
             :width="1200"
             :body-style="{height: modelHeight + 'px'}"
             :closable="false"
             :maskClosable="false"
             :visible="visible">
      <a-row>
        <span>文件名称：</span>
        <a-input-search placeholder="输入文件名称搜索" allow-clear v-model="queryParam.inputContent" @search="onSearch" style="width: 200px; margin-bottom: 12px"> </a-input-search>
        <a-divider type="vertical" />
        <span>是否项目必须：</span>
        <a-radio-group v-model="queryParam.isRequired" @change="onSearch">
          <a-radio :value="-1">全部</a-radio>
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
        <a-divider type="vertical" />
        <a-button type="primary" @click="onSearch">查询</a-button>
      </a-row>
      <a-table :columns="columns"
               :data-source="list"
               :rowKey="record => record.fileId"
               :customRow="onRowClick"
               :rowClassName="setRowClassName"
               :pagination="false"
               :loading="loading"
               size="small"
               :body-style="{height: listScrollHeight + 'px'}"
               :scroll="{ x: false, y: listScrollHeight + 'px' }"
               v-watermark
               bordered>
        <template slot="scaleLarge" slot-scope="text, record, index">
          <span>{{record.scaleLarge == 1 ? "√" : ""}}</span>
        </template>
        <template slot="scaleMiddle" slot-scope="text, record, index">
          <span>{{record.scaleMiddle == 1 ? "√" : ""}}</span>
        </template>
        <template slot="scaleSmall" slot-scope="text, record, index">
          <span>{{record.scaleSmall == 1 ? "√" : ""}}</span>
        </template>
        <template slot="scaleTiny" slot-scope="text, record, index">
          <span>{{record.scaleTiny == 1 ? "√" : ""}}</span>
        </template>
        <template slot="isRequired" slot-scope="text, record, index">
          <span>{{record.isRequired == 1 ? "是" : "否"}}</span>
        </template>
      </a-table>

      <template slot="footer">
        <a-button @click="onCancel">关闭</a-button>
      </template>
    </a-modal>

    <a-modal :width="800"
             :body-style="{height: 400 + 'px'}"
             :closable="false"
             :maskClosable="false"
             :visible="uploadVisible"
             v-if="uploadVisible">
      <div slot="title">
        <span>{{uploadTitle}}</span>
        <a v-if="selectedRow && selectedRow.exampleFileId" @click="showExample(selectedRow.fileId, selectedRow.exampleFileId)" style="float: right; font-size: 14px">查看示例</a>
      </div>
      <a-row style="margin-bottom: 5px; height: 40px">
        <a-col v-if="readOnly || (selectedRow && selectedRow.submitRole != 2)" :span="16">
          <a-button @click="download" icon="download"  type="primary" style="margin-right: 8px">查看</a-button>
        </a-col>
        <a-col v-else :span="14">
          <a-button v-if="selectedRow && (selectedRow.fileId == 46 && !finalCheckDate) || (selectedRow.fileId == 24 && !onlineDate)" @click="cantUpload" :disabled="uploading" icon="upload"  type="primary" style="margin-right: 8px">上传</a-button>
          <a-upload v-else :customRequest="handleUpload" :showUploadList="false" :fileList="fileList" :beforeUpload="beforeUpload">
            <a-button :loading="uploading" :disabled="reUploading" icon="upload" type="primary" style="margin-right: 8px">上传</a-button>
          </a-upload>

          <a-button v-if="!uploadSelectedRow" @click="cantReUpload" :disabled="uploading" icon="retweet"  type="primary" style="margin-right: 8px"> 重传</a-button>
          <a-upload v-else :customRequest="handleReUpload" :showUploadList="false" :fileList="fileList" :beforeUpload="beforeUpload">
            <a-button :loading="reUploading" :disabled="uploading" icon="retweet"  type="primary" style="margin-right: 8px"> 重传</a-button>
          </a-upload>

          <a-button @click="download" icon="download"  type="primary" style="margin-right: 8px">查看</a-button>
          <a-button @click="remove" icon="delete"  type="danger" style="margin-right: 8px">删除</a-button>
        </a-col>
        <a-col :span="10" v-if="selectedRow && selectedRow.fileId == 46">
          <a-form-model>
            <a-form-item
              label="终验日期"
              style="margin: 0"
              prop="finalCheckDate"
              :require="true"
              :labelCol="{lg: {span: 12}, sm: {span: 3}}"
              :wrapperCol="{lg: {span: 12}, sm: {span: 20} }" :required="true">
              <a-input v-if="finalCheckDateReadOnly" :value="finalCheckDate" readOnly style="width: 160px;"></a-input>
              <a-date-picker v-else v-model="finalCheckDate" @change="onFinalCheckDateChange" style="width: 160px;"></a-date-picker>
            </a-form-item>
          </a-form-model>
        </a-col>

        <a-col :span="10" v-if="selectedRow && selectedRow.fileId == 24">
          <a-form-model>
            <a-form-item
              label="上线函日期"
              style="margin: 0"
              prop="onlineDate"
              :require="true"
              :labelCol="{lg: {span: 12}, sm: {span: 3}}"
              :wrapperCol="{lg: {span: 12}, sm: {span: 20} }" :required="true">
              <a-input v-if="onlineDateReadOnly" :value="onlineDate" readOnly style="width: 160px;"></a-input>
              <a-date-picker v-else v-model="onlineDate" @change="onOnlineDateChange" style="width: 160px;"></a-date-picker>
            </a-form-item>
          </a-form-model>
        </a-col>
      </a-row>

      <a-table :columns="uploadColumns"
               :data-source="uploadList"
               :pagination="false"
               :rowKey="record=> record.detailId"
               :customRow="onUploadRowClick"
               :rowClassName="setUploadRowClassName"
               :body-style="{height: 295 + 'px'}"
               :scroll="{ x: false, y: 295 + 'px' }"
               size="small"
               v-watermark
               bordered>
        <template slot="rowIndex" slot-scope="text, record, index">
          <span>{{index + 1}}</span>
        </template>

        <template slot="fileSize" slot-scope="text, record, index">
          <span>{{text + " MB"}}</span>
        </template>
      </a-table>

      <div slot="footer" style="height: 42px">
        <div v-if="!readOnly && selectedRow.submitRole == 2" style="float:left;">
          <span style="float:left; color: red">{{notice}}</span><br>
          <span style="float:left; color: red">2.文件大小限制：小于5Mb。上传终验文档时请填写终验日期。</span><br>
        </div>
        <a-button style="margin-top: 5px" @click="onUploadCancel">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script>
  import store from "@/store";

  const columns = [
    {
      title: '提交文档',
      children: [
        {
          title: '编号',
          dataIndex:'fileNo',
          width:'5%',
          align: 'center',
        },
        {
          title: '分工',
          dataIndex:'submitRoleText',
          width:'10%',
          align: 'center',
        },
        {
          title: '类别',
          dataIndex:'fileTypeText',
          width:'10%',
          align: 'center',
        },
        {
          title: '名称',
          dataIndex:'fileName',
          width:'28%',
          align: 'left',
        },
      ],
    },
    {
      title: '项目规模',
      children: [
        {
          title: '大',
          dataIndex:'scaleLarge',
          width:'5%',
          align: 'center',
          scopedSlots: { customRender: 'scaleLarge' },
        },
        {
          title: '中',
          dataIndex:'scaleMiddle',
          width:'5%',
          align: 'center',
          scopedSlots: { customRender: 'scaleMiddle' },
        },
        {
          title: '小',
          dataIndex:'scaleSmall',
          width:'5%',
          align: 'center',
          scopedSlots: { customRender: 'scaleSmall' },
        },
        {
          title: '微',
          dataIndex:'scaleTiny',
          width:'5%',
          align: 'center',
          scopedSlots: { customRender: 'scaleTiny' },
        },
      ],
    },
    {
      title: '是否必须',
      dataIndex:'isRequired',
      width:'5%',
      align: 'center',
      scopedSlots: { customRender: 'isRequired' },
    },
    {
      title: '客户确认方式',
      dataIndex:'signatureText',
      width:'7%',
      align: 'center',
    },
    {
      title: '上传数量',
      dataIndex:'uploadQuantity',
      width:'5%',
      align: 'center',
    },
    {
      title: '最新上传日期',
      dataIndex:'uploadDate',
      width:'10%',
      align: 'center',
    },
  ]
  const uploadColumns = [
    {
      title: '序号',
      dataIndex:'rowIndex',
      width:'6%',
      align: 'left',
      scopedSlots: { customRender: 'rowIndex' },
    },
    {
      title: "项目名称",
      dataIndex: "projectName",
      width:'25%',
      align: 'left',
    },
    {
      title: '文件名',
      dataIndex:'fileName',
      width:'37%',
      align: 'left',
    },
    {
      title: '上传时间',
      dataIndex:'uploadDate',
      width:'12%',
      align: 'left',
    },
    {
      title: '上传人员',
      dataIndex:'uploadPersonName',
      width:'10%',
      align: 'left',
    },
    {
      title: '文件大小',
      dataIndex:'fileSize',
      width:'10%',
      align: 'left',
      scopedSlots: { customRender: 'fileSize' },
    },

  ]

  import {getWordDisplayList, getWordList, getWordDetailList, downloadWord, uploadWord, removeWord, getFinalCheckDate, getOnlineDate, getWordTypeList, getStandradWord} from '@/api/progress/progressReport'
  import moment from 'moment/moment'
  export default {
    name: "FileUpload",
    props: {
      contractNo: {
        type: String,
        default: "2013-0899",
      },
      projectId: {
        type: String,
        default: "22695",
      },
      visible: {
        type: Boolean,
        default: false
      },
      readOnly: {
        type: Boolean,
        default: false
      },
      modelTitle: {
        type:String,
        default: "项目资料上传"
      },
    },
    model: {
      prop: 'visible',
      event: 'cancel'
    },
    data() {
      return {
        modelHeight: window.innerHeight - 285,
        listScrollHeight: window.innerHeight - 428,
        queryParam: {
          inputContent: null,
          isRequired: -1, //-1全部 0否 1是
        },

        columns,
        list: [],
        loading: false,
        selectedRow: null,

        uploadTitle: "文件上传",
        uploadVisible: false,
        uploadColumns,
        uploadList: [],
        uploadLoading: false,
        uploadSelectedRow: null,

        uploadTypes: [],
        fileList: [],
        uploading: false,
        reUploading: false,

        finalCheckDate: null,
        finalCheckDateReadOnly: false,
        onlineDate: null,
        onlineDateReadOnly: false,
        standardWord: {},
        notice: "1.文件大小限制：小于5Mb。上传终验文档时请填写终验日期。"
      }
    },
    methods: {
      moment,
      onCancel() {
        this.selectedRow = null
        this.queryParam.inputContent = null
        this.queryParam.isRequired = -1
        this.$emit("cancel")
      },
      onUploadCancel() {
        this.uploadVisible = false;
        this.uploadList = []
        this.finalCheckDate = null
        this.getWordList()
      },
      onSearch() {
        this.selectedRow = null
        this.getWordList()
      },
      getWordList() {
        const params = {
          "contractNo": this.contractNo,
          "inputContent": this.queryParam.inputContent,
          "isRequired": this.queryParam.isRequired == -1 ? null : this.queryParam.isRequired,
        }
        this.loading = true
        /*if (this.readOnly) {
          getWordList(params).then(res => {
            this.loading = false
            this.list = res.body
          })
        } else {

        }*/
        getWordDisplayList(params).then(res => {
          this.loading = false
          this.list = res.body
        })
      },

      getWordDetailList() {
        const params = {
          "contractNo": this.contractNo,
          "standardWordId": this.selectedRow.fileId,
        }
        this.uploadLoading = true
        getWordDetailList(params).then(res => {
          this.uploadLoading = false
          this.uploadList = res.body
        })
      },

      getStandardWord() {
        const params = {
          "contractNo": this.contractNo,
          "projectId": this.projectId,
          "standardWordId": this.selectedRow.fileId,
        }
        getStandradWord(params).then(res => {
          this.standardWord = res.body
        })
      },
      getWordTypeList() {
        getWordTypeList().then(res => {
          this.uploadTypes = res.body
          var types = ''
          this.uploadTypes.forEach(item => {
            types = types + item.name + "，"
          })
          if (types.length > 0) {
            types = types.substring(0, types.length - 1)
          }
          this.notice = "1.文件上传类型：" + types + "。"
          console.log(this.notice)
        })
      },

      showExample(fileId, exampleFileId){
        var src = "/api/progressrespot/file/exampleFileId=" + exampleFileId
        var newWindow = window.open(src, '_blank');
        newWindow.onload = function () {
          // 定时器根据实际情况取舍。
          setTimeout(function () {
            if (fileId == 24) {
              newWindow.document.title = "《系统上线确认函》示例文档";
            } else if (fileId == 46) {
              newWindow.document.title = "《终验报告》示例文档";
            } else {
              newWindow.document.title = "示例文档";
            }
          }, 1000)
        }
      },
      onRowClick(record) {
        return {
          on: {
            click: () => {
              console.log(record)
              this.selectedRow = record
              this.uploadTitle = record.fileName
              this.uploadSelectedRow = null
              this.getWordDetailList()
              this.getStandardWord()
              if (this.selectedRow.fileId == 46) {
                const params = {"contractNo": this.contractNo}
                getFinalCheckDate(params).then(res => {
                  if (res.body != null) {
                    console.log(res.body)
                    this.finalCheckDate = moment(res.body).format("YYYY-MM-DD")
                    this.finalCheckDateReadOnly = true
                  }
                  this.uploadVisible = true
                })
              } else if (this.selectedRow.fileId == 24) {
                const params = {"contractNo": this.contractNo}
                getOnlineDate(params).then(res => {
                  if (res.body != null) {
                    console.log(res.body)
                    this.onlineDate = moment(res.body).format("YYYY-MM-DD")
                    this.onlineDateReadOnly = true
                  }
                  this.uploadVisible = true
                })
              } else {
                this.uploadVisible = true
              }
            }
          }
        }
      },
      setRowClassName (record) {
        return this.selectedRow && record.fileId === this.selectedRow.fileId ? 'clickRowStyle' : ''
      },
      onUploadRowClick(record) {
        return {
          on: {
            click: () => {
              this.uploadSelectedRow = record
            }
          }
        }
      },
      setUploadRowClassName (record) {
        return this.uploadSelectedRow && record.detailId === this.uploadSelectedRow.detailId ? 'clickRowStyle' : ''
      },
      onFinalCheckDateChange(date, dateStr) {
        if(dateStr) {
          this.finalCheckDate = moment(dateStr).format("YYYY/MM/DD")
        } else {
          this.finalCheckDate = null
        }
      },
      onOnlineDateChange(date, dateStr) {
        if(dateStr) {
          this.onlineDate = moment(dateStr).format("YYYY/MM/DD")
        } else {
          this.onlineDate = null
        }
      },
      remove() {
        if (this.uploadList.length == 0) {
          this.$message.info("未上传任何文件！")
          return
        }
        if(!this.uploadSelectedRow) {
          this.$message.info("请先选择文件！")
          return
        }

        this.$confirm({
          title: '确认删除选中文件吗？',
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
          onOk: ()=> {
          },
          onCancel: ()=> {
            const params = {
              "contractNo": this.contractNo,
              "wordId": this.uploadSelectedRow.detailId,
              "wordDBid":this.uploadSelectedRow.detailDBId,
            }
            removeWord(params).then(res => {
              this.$message.success("删除成功！")
              this.uploadSelectedRow = null
              this.getWordDetailList()
            })
          }
        })

      },

      cantUpload() {
        if (this.selectedRow.fileId == 46 && !this.finalCheckDate) {
          this.$message.info("请填终验日期！")
        } else if (this.selectedRow.fileId == 24 && !this.onlineDate) {
          this.$message.info("请填上线函日期！")
        }
      },
      cantReUpload() {
        if (this.uploadList.length == 0) {
          this.$message.info("未上传任何文件！")
        } else {
          this.$message.info("请先选择文件！")
        }
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
      },
      handleUpload () {
        this.uploading = true
        const { fileList } = this
        const formData = new FormData()
        fileList.forEach(file => {
          formData.append('file', file)
        })
        formData.append('fileKey', this.standardWord.fileKey)
        formData.append('contractNo', this.contractNo)
        formData.append('id', '')
        formData.append('detailId', '')
        formData.append("milepostId", '')
        if (this.selectedRow.fileId == 24 && !this.onlineDateReadOnly) {
          formData.append("onlineDate", this.onlineDate)
        }else if (this.selectedRow.fileId == 46 && !this.finalCheckDateReadOnly) {
          formData.append("finalCheckDate", this.finalCheckDate)
        }
        uploadWord(formData).then(res => {
          this.uploading = false
          if (res.code === 200) {
            this.$message.success("上传成功！")
            this.getWordDetailList()
          }
        })
      },
      handleReUpload () {
        this.reUploading = true
        const { fileList } = this
        const formData = new FormData()
        fileList.forEach(file => {
          formData.append('file', file)
        })
        formData.append('fileKey', this.uploadSelectedRow.infoId)
        formData.append('contractNo', this.contractNo)
        formData.append('id', this.uploadSelectedRow.detailId)
        formData.append('detailId', this.uploadSelectedRow.detailDBId)
        formData.append("milepostId", this.uploadSelectedRow.milepostId ? this.uploadSelectedRow.milepostId : '')
        console.log(formData)
        uploadWord(formData).then(res => {
          this.reUploading = false
          if (res.code === 200) {
            this.$message.success("重传成功!")
            this.getWordDetailList()
          }
        })
      },

      download () {
        if (this.uploadList.length == 0) {
          this.$message.info("未上传任何文件！")
          return
        }
        if(!this.uploadSelectedRow) {
          this.$message.info("请先选择文件！")
          return
        }
        const param = {
          'contractNo': this.contractNo,
          'dbDetailId': this.uploadSelectedRow.detailDBId
        }
        downloadWord(param).then(res => {
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

    },
    mounted() {
      this.onSearch()
      this.getWordTypeList()
    }
  }
</script>

<style scoped>
  /deep/ .clickRowStyle {
     background-color: #E8F7FF;
     color: #1890FF
   }
  /deep/ .ant-table-placeholder{
    display:none;
  }
</style>