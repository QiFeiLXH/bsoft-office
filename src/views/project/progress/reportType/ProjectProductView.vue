<template>
  <a-card :bordered="false" :bodyStyle="{height:'2000px',padding: '10px 10px'}">

    <template>
      <div style="margin-bottom:10px">
        <a-input-search placeholder="合同号或项目名称"
                        v-model="queryParam.contractInput"
                        style="width: 200px"
                        :allowClear="true"
                        @search="onfindProjectChange"
                        @pressEnter="onfindProjectChange"
        />
        <a-divider type="vertical" />
        <person-select v-model="queryParam.projectInput" placeholder="项目经理工号、姓名、简拼检索" style="width: 250px" @change="handleProgressManagerChange" :allowClear="true"></person-select>
        <a-divider type="vertical" />
        <a-checkbox-group  v-model="queryParam.maintain" :options="options" @change="onStatusChange"/>

      </div>
    </template>

    <a-table :columns="columns"
             :dataSource="data"
             :loading="loading"
             size="small"
             :rowKey="(record,index)=> record.projectId"
             :showPagination = 'false'
             :pagination = 'false'
             :rowClassName="setRowClassNameProject"
             :customRow="rowClickProject"
             v-watermark
             :scroll="{ x: false,y: listScrollHeight }"
             :bodyStyle="{ height: listScrollHeight + 'px' }">

      <template slot="rowIndex" slot-scope="text, record, index">
        {{ (page.pageNo-1) * page.pageSize + index + 1}}
      </template>
      <template slot="maintain" slot-scope="text, record, index">
        <span v-if="record.maintain>0">
        {{record.maintain}}
        </span>
        <span v-else-if="record.maintain==0">
        已维护
        </span>
      </template>

      <template slot="operation" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span >
            <a  type="primary" @click="() => update(record,index)">修改</a>
          </span>
        </div>
      </template>
    </a-table>
    <footer-tool-bar>
      <a-pagination
        :total="page.totalCount"
        :pageSize.sync="page.pageSize"
        v-model="page.pageNo"
        @change="pageChange"
        :showTotal="total => `共 ${total} 条`"
        style="margin-top: 10px"/>
    </footer-tool-bar>

    <a-drawer
      title="进度上报类型维护"
      :wrapStyle="{overflow: 'hidden'}"
      placement="right"
      :closable="false"
      :width="1100"
      @close="onDrawerClose"
      :visible="drawerVisible"
      :bodyStyle="{ padding: '0px 0px 0px 0px' }"
    >
      <a-card :bordered="false" :body-style="{ height:drawerCardHeight + 'px',padding:'0px 0px 0px 0px'}" >

          <a-row style="padding: 10px 0">
            <a-input-search placeholder="模块名称"
                            v-model="queryProductParam.moduleName"
                            style="width: 200px;margin-left: 10px"
                            :allowClear="true"
                            @search="handleTableFindProduct"
                            @pressEnter="handleTableFindProduct"

            />
            <a-divider type="vertical" />
            <a-checkbox-group  v-model="queryProductParam.maintain" :options="productOptions" @change="onProductStatusChange"/>
            <a-divider type="vertical" />
            <a-button type="primary" style="margin-left:10px" @click="()=> add()">
              新增
            </a-button>
            <a-button type="primary" style="margin-left:10px" @click="()=> handleTableFindProduct()">
              查询
            </a-button>
          </a-row>
          <a-row>
          <a-table :columns="productCol"
                   :dataSource="productData"
                   size="small"
                   :rowKey="(record,index)=> record.id"
                   :showPagination = 'true'
                   :pagination="pagination"
                   :scroll="{ x: false,y: recordListScrollHeight }"
                   :bodyStyle="{ height: recordListScrollHeight + 'px' }"
                   :rowClassName="setRowClassNameProduct"
                   :customRow="rowClickProduct"
                   @change="handleTableChangeProduct"
                   style="margin-left: 10px"
                   v-watermark
          >

            <template slot="rowIndex" slot-scope="text, record, index">
              {{ (pagination.current-1) * pagination.pageSize + index + 1}}
            </template>


            <template
              slot="reportType"
              slot-scope="text, record,index"
            >
              <template >
                <a-select :default-value="{key:record.reportType?record.reportType:'',label:text?text:''}"
                          style="width: 120px"
                          :labelInValue="true"
                          @change="reportTypeChange(record,$event)"  size="small">
                  <a-select-option v-for="d in reportTypeData" :key="d.id">
                    {{ d.name }}
                  </a-select-option>
                </a-select>
              </template>
<!--              <template >-->
<!--                {{text}}-->
<!--              </template>-->
            </template>

            <template
              slot="constructionType"
              slot-scope="text, record"
            >
              <template>
                <a-select :default-value="{key:record.constructionType?record.constructionType:'',label:text?text:''}"
                          style="width: 150px"
                          :labelInValue="true"
                          @change="constructionTypeChange(record,$event)"  size="small">
                  <a-select-option v-for="d in constructionTypeData" :key="d.id">
                    {{ d.name }}
                  </a-select-option>
                </a-select>
              </template>
<!--              <template >-->
<!--                {{text}}-->
<!--              </template>-->

            </template>

            <template  slot="orgNum"  slot-scope="text, record" >
              <a-input-number
                style="margin: -5px 0"
                size="small"
                :max="999"
                :min="1"
                :step="1"
                :precision="0"
                v-model="record.orgNum"
                @change="orgNumInputChange(record,$event)"
              />
<!--              <template >-->
<!--                {{ text }}-->
<!--              </template>-->
            </template>

            <template slot="operation" slot-scope="text, record, index">
            <span v-if="record.editableProduct">
              <a  @click="() => cancelProduct(index)" style="margin-right: 10px">取消</a>
             </span>
<!--              <span v-else>-->
<!--             <a :disabled="record.editingKey == ''" v-if="!record.sumbitFlag==1" @click="() => editProduct(index)" style="margin-right: 10px">编辑</a>-->
<!--            </span>-->
            </template>
          </a-table>
          </a-row>

        <div :style="{ position: 'absolute', right: 10, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '9px 16px', background: '#fff', textAlign: 'right',}">
          <a-button  type="primary"  @click="handleSubmit" style="margin-left: 20px">保存</a-button>
          <a-button  @click="onDrawerClose" style="margin-left: 20px">退出</a-button>
        </div>
      </a-card>
    </a-drawer>
  </a-card>
</template>
<script>
  import FooterToolBar from '@/components/FooterToolbar'
  import {PersonSelect } from '@/module'
  import {getprojectproductviews } from '@/api/projectproductView'
  import {getprojectproducts,saveprojectproducts,getconstructiontypelist,submitprojectproducts } from '@/api/projectproduct'
  import { getproreporttypelist } from '@/api/reportType'
  import store from "@/store";
  import moment from 'moment/moment'


  const statusMap = {
    0: {status: 'success', text: '已维护'},
    1: {status: 'processing', text: '未维护'},
  }
  const options = [
    { label: '未维护', value: 1 },
    { label: '已维护', value: 0 },

  ]
  const productOptions = [
    { label: '未维护', value: 1 },
  ]

  const columns = [
    {
      title: '序号',
      width:'8%',
      dataIndex:'rowIndex',
      align: 'left',
      scopedSlots: { customRender: 'rowIndex' },
    },
    {
      title: '回款业绩部门',
      width:'10%',
      dataIndex: 'rollbackDeptName',
      scopedSlots: { customRender: 'rollbackDeptName' },
    },
    {
      title: '合同号',
      width:'10%',
      dataIndex: 'contractNo',
      scopedSlots: { customRender: 'contractNo' },
    },
    {
      title: '项目名称',
      width:'20%',
      dataIndex: 'projectName',
      scopedSlots: { customRender: 'projectName' },
    },

    {
      title: '项目经理',
      width:'10%',
      dataIndex: 'projectManagerName',
      scopedSlots: { customRender: 'projectManagerName' },
    },
    {
      title: '进度经理',
      width:'10%',
      dataIndex: 'progressManagerName',
      scopedSlots: { customRender: 'progressManagerName' },
    },
    {
      title: '未维护模块',
      width:'10%',
      dataIndex: 'maintain',
      scopedSlots: { customRender: 'maintain' },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width:'10%',
      scopedSlots: { customRender: 'operation' },
    },
  ];

  const productCol = [
    {
      title: '序号',
      width:'8%',
      dataIndex:'rowIndex',
      align: 'left',
      scopedSlots: { customRender: 'rowIndex' },
    },
    {
      title: '合同模块名称',
      width:'15%',
      dataIndex: 'moduleName',
      scopedSlots: { customRender: 'moduleName' },
    },
    {
      title: '产品模块名称',
      width:'15%',
      dataIndex: 'productName',
      scopedSlots: { customRender: 'productName' },
    },
    {
      title: '模块上报分类',
      width:'10%',
      dataIndex: 'reportTypeName',
      scopedSlots: { customRender: 'reportType' },
    },
    {
      title: '承建分工',
      width:'12%',
      dataIndex: 'constructionTypeName',
      scopedSlots: { customRender: 'constructionType' },
    },
    {
      title: '目标机构数',
      width:'10%',
      dataIndex: 'orgNum',
      scopedSlots: { customRender: 'orgNum' },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width:'8%',
      scopedSlots: { customRender: 'operation' },
    },
  ];


  export default {
    components:{
      FooterToolBar,
      PersonSelect,
    },
    name: "ProjectProductViewManager",
    data() {
      return {
        data:[],
        columns,
        selectRecordId:0,//抽屉查找修改ID
        itemData:[],
        listScrollHeight:window.innerHeight - 10,
        editingKey: '',
        queryParam: {contractInput: null,projectInput:null,pageNo:1,pageSize:25,maintain: [1],},
        value: null,
        customId: 0,
        loading: false,
        page: { pageNo: 1, pageSize: 25, totalCount: 0 },
        isLoading: false,
        formLayout: 'horizontal',
        options,
        maintain:[],
        findFlag:false,

        //承建分工:1自主,2采购外包自主实施,3采购外包非自主实施

        productData:[],
        constructionTypeData:[],
        oldProductData:[],
        reportTypeData:[],
        productCol,
        productOptions,
        editableProduct:false,
        drawerVisible:false,
        modelName:null,
        changedProductId:null,//选中行的id
        currentRecord:null,//当前选中行
        editingKeyProduct:null,
        changedProductRows:[],
        editingProductKey:'',
        queryProductParam:{moduleName:null,maintain: [0],projectId:null,pageNo:1,pageSize:25},
        pagination: { current: 1, pageSize: 25, total: 0 },

        drawerCardHeight: window.innerHeight - 55,
        formHeight: window.innerHeight - 100,
        recordListScrollHeight: window.innerHeight - 250,



      };
    },

    computed: {
      rowSelection() {
        return {
          onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          },


          getCheckboxProps: record => ({
            props: {
              disabled: record.name === 'Disabled User', // Column configuration not to be checked
              name: record.name,
            },
          }),
        };
      },

    },

    mounted(){
      this.doQuery();
      this.loadReportTypeListData();
      this.loadConstructiontypeList();
      this.listScrollHeight = window.innerHeight - 258
    },


    methods: {
      rowClickProject(record) {
        return {
          on: {
            click: ()=> {
              this.selectRecordId =  record.projectId
            },
            dblclick: () => {
              this.selectRecordId = record.projectId
            }
          }
        }
      },
      setRowClassNameProject(record) {
        if (this.selectRecordId == record.projectId) {
          return 'clickRowStyle'
        }
      },
      doQuery() {
        if(this.queryParam.maintain == null || this.queryParam.maintain == [] || this.queryParam.maintain.length ==0) {
          this.data = []
          return
        }
        getprojectproductviews(this.queryParam).then(res => {
          if(res.code===200){
            this.page.totalCount = res.body.totalCount;
            this.data = res.body.items;
          }
        })
      },

      pageChange(current) {
        if(this.queryParam.maintain == null || this.queryParam.maintain == [] || this.queryParam.maintain.length ==0) {
          this.data = []
          return
        }
        this.queryParam.pageNo = current;
        this.queryParam.pageSize = this.page.pageSize;
        this.queryParam.companyType = this.value;
        getprojectproductviews(this.queryParam)
          .then(res => {
            if (res.code === 200) {
              this.data = res.body.items;
              this.page.totalCount = res.body.totalCount;
            }
          })
      },

      onfindProjectChange(){
        if(this.queryParam.maintain == null || this.queryParam.maintain == [] || this.queryParam.maintain.length ==0) {
          this.data = []
          return
        }
        this.queryParam.pageNo=1
        getprojectproductviews(this.queryParam).then(res => {
          if(res.code===200){
            this.page.totalCount = res.body.totalCount;
            this.data = res.body.items;
            this.page.pageNo=1
          }
        })
      },

      handleProgressManagerChange (val) {
        this.queryParam.projectInput = val
        this.onfindProjectChange()
      },
      update(record, index){
        this.editingKey=''
        this.queryProductParam.moduleName=null
        this.queryProductParam.maintain=[1]
        this.queryProductParam.projectId=record.projectId
        this.queryProductParam.pageNo=1
        this.pagination.current=1
        if(this.queryProductParam.projectId!=null){
          getprojectproducts(this.queryProductParam).then(res => {
            if (res.code === 200) {
              this.pagination.total = res.body.totalCount;
              res.body.items.forEach(item=>{
                item['editableProduct'] = false

                if(!item.orgNum){
                  item.orgNum = 1
                }
                if(item.constructionType){
                  item.constructionType = 1
                }
                if(!item.reportType){
                  item.reportType = null
                }
              })
              this.productData = Object.assign([],res.body.items)
              this.oldProductData = this.productData.map(item => ({ ...item }))
              this.drawerVisible = true
            }
          })
        }

      },



      onStatusChange(maintain) {
        if(maintain.length===0){
          this.queryParam.maintain =null
        }else {
          this.queryParam.maintain = maintain
        }
        this.page.pageNo = 1
        this.queryParam.pageNo = 1;
        this.onfindProjectChange()
      },

      handleTableAddProduct() {
        const me = this
        if(this.editingKey!==''){
          this.$confirm({
            title: '数据未保存,是否需要保存?',
            onOk () {

              me.handlePageSubmit()
              me.productData=[]
              me.oldProductData=[]
              me.onfindProductChange()
            },
            onCancel () {
              me.editingKey=''
              me.productData=[]
              me.oldProductData=[]
              me.onfindProductChange()
            }
          })
        }else {
          this.onfindProductChange()
        }

      },



      handleTableFindProduct() {
        const me = this
        if(this.editingKey!==''){
          this.$confirm({
            title: '数据未保存,是否需要保存?',
            onOk () {

              me.handlePageSubmit()
              me.productData=[]
              me.oldProductData=[]
              me.onfindProductChange()
            },
            onCancel () {
              me.editingKey=''
              me.productData=[]
              me.oldProductData=[]
              me.onfindProductChange()
            }
          })
        }else {
          this.onfindProductChange()
        }

      },



      loadListProductData(){
        this.onfindProductChange();
      },

      onProductStatusChange(maintain){
        if(maintain.length>0) {
          //未维护
          this.queryProductParam.maintain = [1]
        }else {
          //已维护
          this.queryProductParam.maintain = [0]
        }
        this.handleTableFindProduct()
      },

      findProductChange(){
        getprojectproducts(this.queryProductParam).then(res => {
          if(res.code===200){
            this.pagination.total = res.body.totalCount;
            res.body.items.forEach(item=>{
              item['editableProduct'] = false

              if(!item.orgNum){
                item.orgNum = 1
              }
              if(item.constructionType){
                item.constructionType = 1
              }
              if(!item.reportType){
                item.reportType = null
              }
            })
            this.productData = Object.assign([],res.body.items)
            this.oldProductData = this.productData.map(item => ({ ...item }))
          }
        })
      },


      onfindProductChange(){
        this.queryProductParam.pageNo=1
        this.pagination.current = 1
        getprojectproducts(this.queryProductParam).then(res => {
          if(res.code===200){
            this.pagination.total = res.body.totalCount;
            res.body.items.forEach(item=>{
              item['editableProduct'] = false

              if(!item.orgNum){
                item.orgNum = 1
              }
              if(item.constructionType){
                item.constructionType = 1
              }
              if(!item.reportType){
                item.reportType = null
              }
            })
            this.productData = Object.assign([],res.body.items)
            this.oldProductData = this.productData.map(item => ({ ...item }))
          }
        })
      },
      setRowClassNameProduct(record) {
        if (this.changedProductId===record.id ){
          return 'clickRowStyle'
        }
        if(record.sumbitFlag == 1){
          return 'greyStyle'
        }
      },
      rowClickProduct(record,index) {
        return {
          on: {
            click: ()=> {
              this.currentRecord = record
              this.changedProductId=record.id
            },
          }
        }
      },

      handleTableChangeProduct(pagination) {
        const me = this
        if(this.editingKey!==''){
          this.$confirm({
            title: '数据未保存,是否需要保存?',
            onOk () {
              me.handlePageSubmit()
              console.log(pagination)
              me.pagesChange(pagination)
            },
            onCancel () {
              me.editingKey=''
              me.pagesChange(pagination)
            }
          })
        }else {
          this.pagesChange(pagination)
        }

      },

      pagesChange(pagination){
        console.log(pagination)
        this.pagination.current = pagination.current
        this.pagination.pageSize = pagination.pageSize
        this.queryProductParam.pageNo = pagination.current
        this.changedProductId = null
        this.changedProductRows = null
        this.findPage()
      },
      findPage(){
        this.productData= null
        this.oldProductData =null
        getprojectproducts(this.queryProductParam).then(res => {
          if(res.code===200){
            this.pagination.total = res.body.totalCount;
            res.body.items.forEach(item=>{
              item['editableProduct'] = false
              if(!item.orgNum){
                item.orgNum = 1
              }
              if(item.constructionType){
                item.constructionType = 1
              }
              if(!item.reportType){
                item.reportType = null
              }
            })
            this.productData = Object.assign([],res.body.items)
            this.oldProductData = this.productData.map(item => ({ ...item }))
          }
        })
      },

      orgNumInputChange (record, key) {
        record.editableProduct = true
        /*const newData = [...this.productData];
        const target = newData.filter(item => key === item.id)[0];
        console.log(target)
        if (target) {
          target.proportion = val;
          this.productData = newData;
        }*/
      },
      // editProduct(index) {
      //   const newData = this.productData.map(item => ({...item}));
      //   const target = newData[index];
      //   if (target) {
      //     target['editingKey'] = index
      //     target['editableProduct'] = true
      //     if(!target['orgNum']){
      //       target['orgNum'] = 1
      //     }
      //     if(!target['constructionType']){
      //       target['constructionType'] = 1
      //     }
      //     if(!target['reportType']){
      //       target['reportType'] = null
      //     }
      //   }
      //   this.productData=newData
      //   // this.productData=newData.map(item => ({...item}));
      //   this.editingKey = index;
      // },
      cancelProduct(index) {
        const newData = this.productData.map(item => ({...item}));
        // const newData = [...this.productData];
        let target = newData[index];
        if(target.id < 0){
          this.productData.splice(index,1);
        }else{
          if (target) {
            delete target.editingKey;
            delete target.editableProduct;
          }
          target = this.oldProductData[index]
          console.log(target)
        }
        newData[index] = target
        this.editingKey = '';
        this.productData=newData

      },
      handlePageSubmit() {
        this.productData.forEach(item=>{
          delete item.editableProduct
        })
        saveprojectproducts(this.productData).then(res =>{
          if (res.code === 200) {
            this.$message.success("保存成功")
            this.editingKey = ''
            this.oldProductData = []
            this.productData = res.body.items
            this.doQuery();
          }
        })
      },

      handleSubmit() {
        this.productData.forEach(item=>{
          delete item.editableProduct
        })
        saveprojectproducts(this.productData).then(res =>{
          if (res.code === 200) {
            this.$message.success("保存成功")
            this.editingKey = ''
            this.productData = []
            this.oldProductData = []
            this.productData = res.body.items
            this.queryProductParam.pageNo = this.pagination.current
            this.findProductChange()
            this.doQuery();
          }
        })
      },

      loadReportTypeListData(){
        getproreporttypelist().then((res) => {
          if (res.code === 200) {
            this.reportTypeData=res.body
          }
        })
      },
      loadConstructiontypeList(){
        const temp = {
          type:2006,
          flag:null,
          inputContent:null
        }
        getconstructiontypelist(temp).then((res) => {
          if (res.code === 200) {
            this.constructionTypeData=res.body
          }
        })
      },


      onDrawerClose(){
        this.oldProductData = []
        this.drawerVisible=false
      },
      constructionTypeChange(record,e){
        record.editableProduct = true
        record.constructionType = e.key
        record.constructionTypeName = e.label
      },

      reportTypeChange(record,e){
        record.editableProduct = true
        record.reportType = e.key
        record.reportTypeName = e.label
      },

      productPageChange(current) {
        if(this.queryProductParam.maintain == null || this.queryProductParam.maintain == [] || this.queryProductParam.maintain.length ==0) {
          this.productData = []
          return
        }
        this.queryProductParam.pageNo = current;
        this.queryProductParam.companyType = this.value;
        getprojectproductviews(this.queryProductParam)
          .then(res => {
            if (res.code === 200) {
              this.productData = res.body.items;
              this.queryProductParam.totalCount = res.body.totalCount;
            }
          })
      },

    }
  };

</script>
<style>
  components-table-demo-size h4 {
    margin-bottom: 16px;
  }
  .editable-row-operations a {
    margin-right: 8px;
  }
  .ant-select-disabled .ant-select-selection {
    background: #ffffff;
    cursor: not-allowed;
    color: #000000;
  }
  .ant-checkbox-disabled + span {
    color: #000000;
    cursor: not-allowed;
  }
  .ant-radio-disabled + span {
    color: #000000;
    cursor: not-allowed;
  }
/*  .ant-select-selection__rendered{
    height: 32px;
    width: 120px;
  }
   .ant-select .ant-select-enabled .ant-select-sm{
     width: 120px;
  }*/
  /*.ant-select .ant-select-enabled .ant-select-sm .ant-select-selection .ant-select-selection--single{*/
  /*  width: 120px;*/
  /*}*/
/*
  ant-select-selection ant-select-selection--single{
    height: 24px;
    width: 120px;
  }
  .ant-select-sm .ant-select-selection--single {
    height: 24px;
    width: 120px;
  }

  .ant-select-selection__rendered .ant-select-selection-selected-value{
    width: 100px;
  }
*/


  /*.companyName .ant-select-selection-selected-value {*/
  /*  margin-top: 3px;*/
  /*}*/
  .ant-input {
    color: #000000;
  }
  .ant-select{
    color: #000000;
  }
  .ant-radio-group{
    margin-top: 18px;
  }


  /deep/ .clickRowStyle {
    background-color: #E8F7FF;
    color: #1890FF
  }
  .greyStyle {
    color: #808080
  }

  .ant-table-placeholder{
    display:none;
  }
</style>
