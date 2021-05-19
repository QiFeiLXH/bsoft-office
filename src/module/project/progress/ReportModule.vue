<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 5px',
    }">
    <a-row style="margin-top: 5px;">
      <a-month-picker style="width: 110px;" :disabled-date="disabledDate" placeholder="进度月份" v-model="progressMonth" @change="doChangeMonth" :allowClear="false"/>
      <a-divider type="vertical"/>上报分类:
      <a-radio-group v-model="reportTypeItem" @change="changeReportType" style="margin-left:5px;margin-top: 0px">
        <a-radio v-for="item in typeData" :value="item" :key="item.reportType" >
          {{ item.name }}
        </a-radio>
      </a-radio-group>
    </a-row>
    <a-row style="margin-top: 5px;">
      <div style="display: flex;justify-content: space-between;">
        <div>
          <a-input-search
            :pressEnter="doChangeInput"
            :allowClear="true"
            v-model="params.inputContent"
            placeholder="产品模块名称"
            @search="doChangeInput"
            style="width: 200px;margin-left:0px;margin-bottom: 5px"/>
          <a-divider type="vertical"/>
          <a-button type="primary" @click="doClickQuery" :loading="isLoading">查询</a-button>
          <a-divider type="vertical"/>
          <a-button type="primary" @click="addProgress" :disabled="addStatus" :loading="!addStatus && isLoading">报进度</a-button>
          <a-divider type="vertical"/>
          <a-button type="primary" @click="fileUploadVisible = true" :loading="isLoading">传文档</a-button>
        </div>
        <span v-if="!addStatus" style="color: red">{{addText}}</span>
      </div>
    </a-row>
    <a-table
      v-watermark
      v-if="columnsType === 1"
      :row-selection=" submitFlag ? null : { selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :loading="isLoading"
      :pagination="false"
      size="small"
      :columns="reportColumns"
      :data-source="reportData"
      :rowKey="(record) => record.id"
      :bodyStyle="{ minHeight: listScrollHeight  + 'px' }"
      :customRow="onRightClickRow"
      :scroll="{ x: listScrollWidth,y: listScrollHeight }"
      :rowClassName="setRightCurrentRow">
      <template slot="rowIndex" slot-scope="text, record, index">
        <span>
          {{ index + 1 }}
        </span>
      </template>
      <template v-for="(item,headerIndex) in headers" :slot="'NODE_' + item.id"  slot-scope="text, record, index">
        <a-input-number
          ref="inputnumber"
          v-if="!submitFlag"
          :disabled="submitFlag"
          style="width: 75px"
          :precision="0"
          size="small"
          :min="0"
          @pressEnter="numberPressEnter($event)"
          :value="record.progressNums == undefined ? null : record.progressNums.split(',')[headerIndex] < 0 ? null : record.progressNums.split(',')[headerIndex]"
          :max="record.orgNum"
          :id="record.id + '_' + record.productId + '_' + item.id"
          @change="change($event, record, item.id,headerIndex,index)"
          @focus="focusNumber($event,record, item.id,headerIndex)"/>
        <span v-else> {{ record.progressNums == undefined ? null : record.progressNums.split(',')[headerIndex] < 0 ? null : record.progressNums.split(',')[headerIndex] }}</span>
      </template>
      <template slot="systemName" slot-scope="text, record, index">
        <a-tooltip placement="topLeft">
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="productName" slot-scope="text, record, index">
        <a-tooltip placement="topLeft">
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="productProgress" slot-scope="text, record, index">
        <span v-if="text == null || text == undefined">
          <span v-if="record.id === -1000" style="color: blue">
            0.00 %
          </span>
          <span v-else-if="record.id != -999">0.00 %</span>
        </span>
        <span v-else>
          <span v-if="record.id === -1000" style="color: blue">
            {{(text * 100).toFixed(2) }} %
          </span>
          <span v-else>{{(text * 100).toFixed(2) }} %</span>
        </span>
      </template>
      <template slot="firstOnLineDate" slot-scope="text, record, index">
        <div v-if="!submitFlag">
          <a-date-picker :disabled="submitFlag" v-if="hasOnlineIds.length > 0 && hasOnlineIds.indexOf(record.id) > - 1" style="border: 1px solid red;border-radius: 4px" size="small" v-model="record.firstOnLineDate" :format="dateFormat" @change="changeFirstDate($event, record)"/>
          <a-date-picker :disabled="submitFlag" v-else size="small" v-model="record.firstOnLineDate" :format="dateFormat" @change="changeFirstDate($event, record)"/>
        </div>
        <span v-else> {{ record.firstOnLineDate }}</span>
      </template>
      <template slot="remarks" slot-scope="text, record, index">
        <a-input v-if="!submitFlag" :disabled="submitFlag" size="small" v-model="record.remarks"></a-input>
        <span v-else>{{text}}</span>
      </template>
    </a-table>
    <a-table
      v-watermark
      v-else
      :loading="isLoading"
      :pagination="false"
      size="small"
      :bodyStyle="{ minHeight: listScrollHeight  + 'px'}"
      :columns="dateColumns"
      :data-source="reportData"
      :rowKey="(record) => record.id"
      :customRow="onRightClickRow"
      :scroll="{ x: listScrollWidth,y: listScrollHeight }"
      :rowClassName="setRightCurrentRow">
      <template slot="rowIndex" slot-scope="text, record, index">
        <span>
          {{ index + 1 }}
        </span>
      </template>
    </a-table>
    <file-upload :contract-no="projectInfo.contractNo"
                 :project-id="projectInfo.projectId"
                 v-if="fileUploadVisible"
                 :visible="fileUploadVisible"
                 @cancel="fileUploadVisible = false"></file-upload>
  </a-card>
</template>

<script>
  import { findtypelist,findheader,getmonthreport,report,checkhasprogress,addprogress,checkenablereport } from "@/api/progress/progressReport";
  import moment from 'moment'
  import FileUpload from "@/views/project/progress/component/FileUpload";
  export default {
  name: "ReportModule",
  components: {FileUpload},
  data(){
    return{
      addText:'',
      submitText:'',
      confirmLoading:false,
      submitFlag:false,
      size:'small',
      dateFormat: 'YYYY-MM-DD',
      selectedRowKeys:[],
      selectedRow:[],
      listScrollWidth:850,
      isLoading:false,
      cardHeight:0,
      addStatus:true,
      listScrollHeight:0,
      reportColumns:[],
      dateColumns:[
        {
          key: 'rowIndex',
          width: 50,
          dataIndex: 'rowIndex',
          title: '序号',
          scopedSlots: { customRender: 'rowIndex' },
          align: 'center',
        },
        {
          key: 'systemName',
          width: 150,
          dataIndex: 'systemName',
          title: '系统名称',
          align: 'left',
          scopedSlots: { customRender: 'systemName' },
          ellipsis:"true"
        },
        {
          key: 'productName',
          width: 200,
          dataIndex: 'productName',
          title: '产品模块名称',
          align: 'left',
          scopedSlots: { customRender: 'productName' },
          ellipsis:"true"
        },
        {
          key: 'checkDate',
          width: 200,
          dataIndex: 'checkDate',
          title: '终验日期',
          align: 'center'
        },
        {
          key: 'termOfService',
          width: 200,
          dataIndex: 'termOfService',
          title: '服务期限(月)',
          align: 'center'
        },
        {
          key: 'startDate',
          width: 200,
          dataIndex: 'startDate',
          title: '开始日期',
          align: 'center'
        },
        {
          key: 'endDate',
          width: 200,
          dataIndex: 'endDate',
          title: '结束日期',
          align: 'center'
        },
        {
          key: 'productProgress',
          width: 200,
          dataIndex: 'productProgress',
          align: 'center',
          scopedSlots: { customRender: 'productProgress' },
          title: '模块进度'
        }
      ],
      reportData:[],
      orgReportData:[],
      typeData:[],
      progressMonth: null,
      orgProgressMonth: null,
      selectedRightRow:null,
      reportTypeItem: null,
      reportType:null,
      columnsType:1,
      orgReportTypeItem: null,
      orgReportType:null,
      orgColumnsType:1,
      params:{
        month: null,
        projectId:null,
        inputContent:''
      },
      headers:[],
      ids:[],
      progressId: null,
      remarks:[],
      fileUploadVisible: false,
      onLineIndex:null,
      checkIndex:null,
      hasOnlineIds:[],//维护了上线数量的产品id
    }
  },
  props: {
    projectInfo: {
      type: Object,
      default: null
    }
  },
  methods:{
    disabledDate(current) {
      return false
      // if (moment(this.progressMonth).format("YYYY-MM") != moment(current).format("YYYY-MM")){
      //   return true
      // }else{
      //   return false
      // }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRows
    },
    showModel(){
      if(this.doCheck()){
        this.doSaveReport()
      }
    },
    doCheck(){
      this.hasOnlineIds = []
      for (var i=0;i<this.reportData.length;i++){
        if (this.reportData[i].progressNums != undefined && this.reportData[i].progressNums != null){
          var progressNums = this.reportData[i].progressNums.split(',')
          var onLineNo = progressNums[this.onLineIndex] == null || progressNums[this.onLineIndex] == -1 || progressNums[this.onLineIndex] == '' ? 0 : parseInt(progressNums[this.onLineIndex])
          var checkNo = progressNums[this.checkIndex] == null || progressNums[this.checkIndex] == -1 || progressNums[this.checkIndex] == '' ? 0 : parseInt(progressNums[this.checkIndex])
          if ((onLineNo + checkNo <= 0) && this.reportData[i].firstOnLineDate == null){
            this.hasOnlineIds.push(this.reportData[i].id)
          }
        }
      }
      if (this.hasOnlineIds.length > 0){
        this.$message.error("上线和终验的总数量小于等于0，请选择预测首次上线日期!")
        return false
      }else{
        return true
      }
    },
    changeFirstDate(date, record){
      if (this.selectedRowKeys.indexOf(record.id) > -1){
        if (this.selectedRow.length > 0){
          for(var i=0;i<this.selectedRow.length;i++){
            var item = this.selectedRow[i]
            item.firstOnLineDate = date
          }
        }
      }else{
        record.firstOnLineDate = date
      }
      this.$forceUpdate()
    },
    updateAllSelectRecord(nodeId,headerIndex,value){
      if (this.selectedRow.length > 0){
        for(var i=0;i<this.selectedRow.length;i++){
          var item = this.selectedRow[i]
          var progressNums = item.progressNums.split(',')
          progressNums[headerIndex] = value + ''
          item.progressNums = progressNums.join(',')
          //修改需保存的数据
          var id = item.id + '_' + item.productId + '_' + nodeId
          let index = this.ids.map((item) => item.id).indexOf(id)
          if(index > - 1){
            this.ids[index].count = value >= item.orgNum ? item.orgNum : value
          }
          this.updateModuleProgress(this.selectedRow[i])
        }
      }
      this.$forceUpdate()
    },
    numberPressEnter(e){
      e.target.blur()
    },
    focusNumber(e,record,nodeId,headerIndex){
      var id = e.target.id
      var progressNum = record.progressNums
      var nodeids = record.nodeids.split(',')
      for(var j=0;j<nodeids.length;j++){
        if(nodeids[j] === nodeId + ''){
          if(progressNum == undefined){
            var progressNums = new Array(nodeids.length)
            if(e.target.value == null || e.target.value == ''){
              progressNums[j] = 1
            }else{
              progressNums[j] = e.target.value
            }
          }else{
            var progressNums = progressNum.split(',')
            if(e.target.value == null || e.target.value == ''){
              progressNums[j] = 1
            }else{
              progressNums[j] = e.target.value
            }
          }
          record.progressNums = progressNums.join(',') + '';
        }
      }
      if (e.target.value == null || e.target.value == ''){
        this.ids.forEach(item => {
          if (item.id === id){
            item.count = 1
          }
        })
      }
      this.updateModuleProgress(record);
      this.$forceUpdate()
    },
    doChangeMonth(){
      const _this = this
      if(!this.isObjectValueEqual(Object.assign([],this.reportData),Object.assign([],this.orgReportData))){
        this.$confirm({
          title: '数据未保存，是否需要保存？',
          // 确认 与 关闭位置对调
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
          onCancel() {
            if (_this.doCheck()){
              _this.doSaveReport()
              if (_this.columnsType === 1){ //按节点进度
                _this.getHeader()
              }else{
                _this.doQuery()
              }
              _this.orgProgressMonth = _this.progressMonth
            }else {
              _this.progressMonth = _this.orgProgressMonth
            }
          },
          onOk() {
            _this.hasOnlineIds = []
            _this.orgProgressMonth = _this.progressMonth
            if (_this.columnsType === 1){ //按节点进度
              _this.getHeader()
            }else{
              _this.doQuery()
            }
          },
        });
      }else{
        this.orgProgressMonth = this.progressMonth
        if (this.columnsType === 1){ //按节点进度
          this.getHeader()
        }else{
          this.doQuery()
        }
      }
    },
    changeReportType(e){
      const _this = this
      if(!this.isObjectValueEqual(Object.assign([],this.reportData),Object.assign([],this.orgReportData))){
        _this.$confirm({
          title: '数据未保存，是否需要保存？',
          // 确认 与 关闭位置对调
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
          onCancel() {
            if (_this.doCheck()){
              _this.doSaveReport()
              _this.reportTypeItem = e.target.value
              _this.reportType = e.target.value.reportType
              _this.columnsType = e.target.value.type
              _this.orgReportTypeItem = _this.reportTypeItem
              _this.orgReportType = _this.reportType
              _this.orgColumnsType = _this.columnsType
              if (_this.columnsType === 1){ //按节点进度
                _this.getHeader()
              }else{
                _this.doQuery()
              }
            }else{
              _this.reportTypeItem = _this.orgReportTypeItem
              _this.reportType = _this.orgReportType
              _this.columnsType = _this.orgColumnsType
            }
          },
          onOk() {
            _this.hasOnlineIds = []
            _this.reportTypeItem = e.target.value
            _this.reportType = e.target.value.reportType
            _this.columnsType = e.target.value.type
            _this.orgReportTypeItem = _this.reportTypeItem
            _this.orgReportType = _this.reportType
            _this.orgColumnsType = _this.columnsType
            if (_this.columnsType === 1){ //按节点进度
              _this.getHeader()
            }else{
              _this.doQuery()
            }
          },
        });
      }else{
        this.reportTypeItem = e.target.value
        this.reportType = e.target.value.reportType
        this.columnsType = e.target.value.type
        this.orgReportTypeItem = this.reportTypeItem
        this.orgReportType = this.reportType
        this.orgColumnsType = this.columnsType
        if (this.columnsType === 1){ //按节点进度
          this.getHeader()
        }else{
          this.doQuery()
        }
      }
    },
    getRemarks(){
      this.remarks = []
      for (var i=0;i<this.reportData.length;i++){
        if (this.reportData[i].id != -999 && this.reportData[i].id != -1000){
          var item = {
            'id': this.reportData[i].id,
            'remarks':this.reportData[i].remarks != null ?  this.reportData[i].remarks : null,
            'firstOnLineDate': this.reportData[i].firstOnLineDate != null ? moment(this.reportData[i].firstOnLineDate).format("YYYY-MM-DD") : null
          }
          this.remarks.push(item)
        }
      }
    },
    doSaveReport(){
      if (this.reportData.length <= 0){
        this.$message.warn("无内容需要保存!")
        return
      }

      const params = {
        'month':moment(this.progressMonth).format("YYYY-MM") + '-01'
      }
      checkenablereport(params).then(res=>{
        if(res.code === 200 && res.body == true){
          this.$warning({
            title: '提醒',
            content:(
              <div>
                <p>1.未上线或终验的模块，应填写预测首次上线日期！</p>
                <p>2.请按管理规范上传文档！</p>
              </div>
            ),
          });
          this.isLoading = true
          this.getRemarks()
          const repparams = {
            'progressId' : this.progressId == undefined ? null : this.progressId,
            'projectId' : this.projectInfo.projectId,
            'month' : moment(this.orgProgressMonth).format("YYYY-MM") +'-01',
            'reportType' : this.reportType,
            'list' : this.ids,
            'remarks':this.remarks
          }
          report(repparams).then(res=>{
            if(res.code === 200){
              this.$message.success("保存成功!")
              this.doQuery()
              this.$emit('getNewProjectProgress')
            }else{
              this.$message.error("保存出错!")
            }
            setTimeout(()=>{
              this.isLoading = false
            },500)
          }).catch(err=>{
            this.isLoading = false
            console.log(err)
          })
        }else if(res.code === 200 && res.body == false){
          this.$message.warn("次月6号之前可修改上月份进度；6号及6号以后上报当月进度，无法修改上月份进度！")
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    doChangeInput(){
      const _this = this
      if(!this.isObjectValueEqual(Object.assign([],this.reportData),Object.assign([],this.orgReportData))){
        this.$confirm({
          title: '数据未保存，是否需要保存？',
          // 确认 与 关闭位置对调
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
          onCancel() {
            if (_this.doCheck()){
              _this.doSaveReport()
              _this.doQuery()
            }
          },
          onOk() {
            _this.hasOnlineIds = []
            _this.doQuery()
          },
        });
      }else{
        this.doQuery()
      }
    },
    isObjectValueEqual(a, b){
      for (var k=0;k<a.length;k++){
        if(a[k].id > 0){
          //取对象a和b的属性名
          var aProps = Object.getOwnPropertyNames(a[k]);
          var bProps = Object.getOwnPropertyNames(b[k]);
          //判断属性名的length是否一致
          if (aProps.length != bProps.length) {
            return false;
          }
          //循环取出属性名，再判断属性值是否一致
          for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if(propName === 'progressNums' || propName === 'firstOnLineDate' || propName ==='remarks'){
              if (a[k][propName] !== b[k][propName]) {
                return false;
              }
            }
          }
        }
      }
      return true;
    },
    doClickQuery(){
      const _this = this
      if(!this.isObjectValueEqual(Object.assign([],this.reportData),Object.assign([],this.orgReportData))){
        this.$confirm({
          title: '数据未保存，是否需要保存？',
          // 确认 与 关闭位置对调
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
          onCancel() {
            if (_this.doCheck()){
              _this.doSaveReport()
              _this.doQuery()
            }
          },
          onOk() {
            _this.hasOnlineIds = []
            _this.doQuery()
          },
        });
      }else{
        this.doQuery()
      }
    },
    doQuery(){
      if (this.reportType == null){
        this.$message.info("请先选择上报分类!")
        return
      }
      const params = {
        'projectId' : this.projectInfo.projectId,
        'month':moment(this.progressMonth).format("YYYY-MM") + '-01'
      }
      checkhasprogress(params).then(res=>{
        if(res.code === 200 && res.body == true){
          this.addStatus = true
          this.initMonthReport()
          this.addText = ''
        }else{
          this.addText = moment(this.progressMonth).format("MM") + "月份进度未上报，请点“报进度”上报"
          this.reportData = []
          this.orgReportData = []
          this.addStatus = false
        }
      }).catch(err=>{
        this.addStatus = true
        this.reportData = []
        this.orgReportData = []
        console.log(err)
      })
    },
    change(value,record,nodeId,headerIndex,index){
      var current = index * this.headers.length + headerIndex
      var currentValue = this.$refs.inputnumber[current].$children[0].currentValue
      if (this.selectedRow.length > 0 && this.selectedRowKeys.indexOf(record.id) > -1){
        this.updateAllSelectRecord(nodeId,headerIndex,currentValue == undefined ? value : currentValue == null ? -1 : currentValue)
      }else{
        var progressNum = record.progressNums
        var nodeids = record.nodeids.split(',')
        for(var j=0;j<nodeids.length;j++){
          if(nodeids[j] === nodeId + ''){
            if(progressNum == undefined){
              var progressNums = new Array(nodeids.length)
              progressNums[j] = value
            }else{
              var progressNums = progressNum.split(',')
              progressNums[j] = value
            }
            record.progressNums = progressNums.join(',') + '';
            this.updateModuleProgress(record);
          }
        }
        var id = record.id + '_' + record.productId + '_' + nodeId
        this.ids.forEach(item => {
          if (item.id === id){
            item.count = value
          }
        })
      }
      this.$forceUpdate()
    },
    updateModuleProgress(record){
      var productProgress = 0.0000;
      const numbers = record.progressNums.split(',')
      for(var i=0;i<this.headers.length;i++){
        var number = numbers[i]
        var proportion = this.headers[i].proportion
        var newnumber = 0
        if(number <= 0){
          newnumber = 0
        }else if(number > record.orgNum){
          newnumber = record.orgNum
        }else{
          newnumber = number
        }
        productProgress = productProgress + (newnumber * proportion) / record.orgNum
      }
      record.productProgress = productProgress
    },
    addProgress(){
      if (this.reportType == null){
        this.$message.info("请先选择上报分类!")
        return
      }
      const params = {
        'month':moment(this.progressMonth).format("YYYY-MM") + '-01'
      }
      checkenablereport(params).then(res=>{
        if(res.code === 200 && res.body == true){
          this.addStatus = true
          const addparams = {
            'projectId' : this.projectInfo.projectId,
            'month':moment(this.progressMonth).format("YYYY-MM") + '-01'
          }
          addprogress(addparams).then(res=>{
            if(res.code === 200){
              this.$message.info("新增成功,请维护进度!")
              this.doQuery()
              this.$emit('getNewProjectProgress')
            }else{
              this.addStatus = false
            }
          }).catch(err=>{
            this.addStatus = false
            console.log(err)
          })
        }else if(res.code === 200 && res.body == false){
          this.$message.warn("次月6号之前可修改上月份进度；6号及6号以后上报当月进度，无法修改上月份进度！")
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    initMonthReport(){
      this.isLoading = true
      this.params.projectId = this.projectInfo.projectId
      this.params.reportType = this.reportType
      this.params.month = moment(this.progressMonth).format("YYYY-MM") + '-01'
      getmonthreport(this.params).then(res=>{
        this.isLoading = false
        if(res.code === 200 && res.body.length > 0){
          this.reportData = []
          this.orgReportData = []
          this.ids = []
          this.reportData = this.reportData.concat(res.body)
          for(var i=0;i<this.reportData.length;i++){
            var productInfo = this.reportData[i]
            this.progressId = productInfo.progressId != null ? productInfo.progressId : this.progressId
            for(var j=0;j<this.headers.length;j++){
              var item = this.headers[j]
              var id = productInfo.id + '_' + productInfo.productId + '_' + item.id
              var nodeids = productInfo.nodeids
              var progressNums = productInfo.progressNums
              if(progressNums == undefined){
                var iditem = {
                  'id':id,
                  'count':-1
                }
                this.ids.push(iditem)
              }else{
                var number = progressNums.split(",")[j]
                if(number != null && number != undefined){
                  var iditem = {
                    'id':id,
                    'count':parseInt(number)
                  }
                  this.ids.push(iditem)
                }else{
                  var iditem = {
                    'id':id,
                    'count':-1
                  }
                  this.ids.push(iditem)
                }
              }
            }
          }
          this.reportData.forEach(item => {
            var orgitem = Object.assign({},item)
            this.orgReportData.push(orgitem)
          })
        }else if(res.code === 200 && res.body.length <= 0){
          this.reportData = []
          this.orgReportData = []
          this.ids = []
        }
        this.selectedRowKeys = []
        this.selectedRow = []
      }).catch(err=>{
        this.isLoading = false
        console.log(err)
      })
    },
    getHeader(){
      this.reportColumns = [
        {
          key: 'rowIndex',
          width: 50,
          dataIndex: 'rowIndex',
          title: '序号',
          scopedSlots: { customRender: 'rowIndex' },
          align: 'center',
        },
        {
          key: 'systemName',
          width: 150,
          dataIndex: 'systemName',
          title: '系统名称',
          align: 'left',
          scopedSlots: { customRender: 'systemName' },
          ellipsis:"true"
        },
        {
          key: 'productName',
          width: 200,
          dataIndex: 'productName',
          title: '产品模块名称',
          align: 'left',
          scopedSlots: { customRender: 'productName' },
          ellipsis:"true"
        },
        {
          key: 'orgNum',
          width: 100,
          dataIndex: 'orgNum',
          title: '目标机构数',
          align: 'center',
        }
      ]
      const params = {
        'projectId':this.projectInfo.projectId,
        'reportTypeId' : this.reportType,
        'month':moment(this.progressMonth).format("YYYY-MM") + '-01'
      }
      findheader(params).then(res=>{
        if(res.code === 200){
          var items = res.body
          this.headers = res.body
          this.listScrollWidth = 850 + 80 * this.headers.length
          var i = 0
          var j = 0
          items.forEach(item => {
            if (item.planName === '上线'){
              this.onLineIndex = i
            }
            if (item.planName === '终验'){
              this.checkIndex = j
            }
            i++
            j++
            var planName = item.planName
            var proportion = (item.proportion * 100).toFixed(2) + '%'
            this.reportColumns.push({
              key: 'NODE_' + item.id,
              width: 80,
              align: 'center',
              dataIndex: 'NODE_' + item.id,
              title: () => {
                return (
                  <div>
                    <div>{planName}</div>
                    <div>{proportion}</div>
                  </div>
                )
              },
              scopedSlots: { customRender: 'NODE_' + item.id },
            })
          })
          this.reportColumns.push({
            key: 'firstOnLineDate',
            width: 130,
            dataIndex: 'firstOnLineDate',
            title: '预测首次上线日期',
            align: 'center',
            scopedSlots: { customRender: 'firstOnLineDate' },
          })
          this.reportColumns.push({
            key: 'productProgress',
            width: 100,
            align: 'center',
            dataIndex: 'productProgress',
            scopedSlots: { customRender: 'productProgress' },
            title: '模块进度'
          })
          this.reportColumns.push({
            key: 'remarks',
            width: 200,
            align: 'left',
            dataIndex: 'remarks',
            scopedSlots: { customRender: 'remarks' },
            title: '备注'
          })
          this.doQuery()
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    doQueryType(){
      const params = {
        'projectId':this.projectInfo.projectId
      }
      findtypelist(params).then(res=>{
        if (res.code === 200){
          this.typeData = []
          this.typeData = this.typeData.concat(res.body)
          if (res.body.length > 0){
            this.columnsType = res.body[0].type
            this.reportTypeItem = res.body[0]
            this.reportType = res.body[0].reportType
            this.orgColumnsType = this.columnsType
            this.orgReportTypeItem = this.reportTypeItem
            this.orgReportType = this.reportType
            if (this.columnsType === 1){ //按节点进度
              this.getHeader()
            }else{
              this.doQuery()
            }
          }
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    onRightClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRightRow = record.id
          }
        }
      }
    },
    setRightCurrentRow (record, index) {
      var styleClassName = ''
      if (record.id === this.selectedRightRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    }
  },
  mounted() {
    var day = moment(new Date()).format('DD')
    this.progressMonth = moment(new Date()).format('YYYY-MM-01')
    this.orgProgressMonth = moment(new Date()).format('YYYY-MM-01')

    // if(parseInt(day)>5){
    //   this.progressMonth = moment(new Date()).format('YYYY-MM-01')
    //   this.orgProgressMonth = moment(new Date()).format('YYYY-MM-01')
    // }else{
    //   this.progressMonth = moment(new Date(), 'YYYY-MM-01').subtract(1, 'months').startOf('month').format('YYYY-MM-01')
    //   this.orgProgressMonth = moment(new Date(), 'YYYY-MM-01').subtract(1, 'months').startOf('month').format('YYYY-MM-01')
    // }
    this.doQueryType()
  },
  created() {
    this.cardHeight = window.innerHeight - 110
    this.listScrollHeight = window.innerHeight - 225
  },
}
</script>

<style scoped lang="less">
/deep/ .ant-input-number-handler-wrap {
        display: none
      }
/deep/ .ant-input[disabled] {
          color: rgba(0, 0, 0, 0.25);
          background-color: #f5f5f5;
          background-color: white;
          color: black;
          cursor: not-allowed;
          opacity: 1;
        }
/deep/ .ant-input-number-disabled .ant-input-number-input {
          cursor: not-allowed;
          color: black;
          background-color: white;
        }
/deep/ .ant-form-item {
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          color: rgba(0, 0, 0, 0.65);
          font-size: 14px;
          font-variant: tabular-nums;
          line-height: 1.5;
          list-style: none;
          -webkit-font-feature-settings: 'tnum';
          font-feature-settings: 'tnum';
          margin-bottom: 0px;
          vertical-align: top;
        }
/deep/ .ant-table-fixed-header .ant-table-fixed-left .ant-table-body-inner {
          padding-right: 0;
          overflow-x: hidden;
        }
/*/deep/ .ant-modal-confirm .ant-modal-body {*/
/*          padding: 32px 24px 24px;*/
/*        }*/
/deep/ .ant-table-placeholder {
          display: none;
          position: relative;
          z-index: 1;
          padding: 0px 0px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
          text-align: center;
          background: #fff;
          border-bottom: 0px solid #e8e8e8;
          border-radius: 0 0 4px 4px;
          margin-top: -5px;
          height: 0px;
        }
/deep/ .ant-empty-normal {
          display: none;
          color: rgba(0, 0, 0, 0.25);
          height: 0px;
        }
/deep/  .ant-empty-description {
          margin: 0;
          display: none;
        }
/deep/  .ant-empty-normal .ant-empty-image {
          display: none;
          height: 0px;
        }
/deep/  .ant-table-thead > tr > th .ant-table-header-column {
          display: inline-block;
          max-width: 100%;
          vertical-align: top;
          line-height: 1;
        }
</style>