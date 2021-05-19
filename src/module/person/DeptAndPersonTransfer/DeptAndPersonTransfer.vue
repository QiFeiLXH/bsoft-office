<template>
  <a-layout>
    <a-layout-header>
      <a-input-search style="margin-bottom: 8px" placeholder="请输入姓名或拼音码查询" @change="onChange"/>
    </a-layout-header>
    <a-layout>
      <a-layout-sider>
        <dept-tree
          @rowclick="rowclick"
        >
        </dept-tree>
      </a-layout-sider>
      <a-layout-content>
        <div style="height: 350px;">
          <a-row>
            <a-col :span="10">
              <a-table
                :rowKey="record => record.personId"
                :pagination="false"
                :bordered="bordered"
                size="small"
                :columns="columns"
                :dataSource="leftList"
                :style="{ background:'white'}"
                :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
                :scroll="{ x: false, y: 300 }"
              >
                <template>
                  <span slot="customTitle"> {{selectedRowKeys.length}} / {{leftList.length}}</span>
                </template>
              </a-table>
            </a-col>
            <a-col :span="4">
              <div style="text-align: center;margin-top: 150px">
                <a-button type="primary" size="small" @click.stop="toSelect">选择<a-icon type="right"/></a-button>
                <a-button type="primary" size="small" style="margin-top: 5px" @click.stop="toCancel"><a-icon type="left"/>取消</a-button>
              </div>
            </a-col>
            <a-col :span="10">
              <a-table
                :rowKey="record => record.personId"
                :pagination="false"
                :bordered="bordered"
                size="small"
                :columns="rightcolumns"
                :dataSource="rightList"
                :style="{ background:'white'}"
                :rowSelection="{selectedRowKeys: rightselectedRowKeys, onChange: onRightSelectChange}"
                :scroll="{ x: false, y: 300 }"
              >
                <template>
                  <span slot="customTitle2"> {{rightselectedRowKeys.length}} / {{rightList.length}}</span>
                </template>
              </a-table>
            </a-col>
          </a-row>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import DeptTree from "@/module/DeptTree/DeptTree"
import { getRoleOrgPersonList, getRolePersonList, saveRolePerson,getPersonList } from '@/api/role'
const columns = [
  {
    dataIndex: 'personName',
    key: 'personName1',
    slots: { title: 'customTitle' },
    scopedSlots: { customRender: 'personName1' },
  }
]
const rightcolumns = [
  {
    dataIndex: 'personName',
    key: 'personName2',
    slots: { title: 'customTitle2' },
    scopedSlots: { customRender: 'personName2' },
  }
]
export default {
  name: 'DeptAndPersonTransfer',
  components: {
    DeptTree
  },
  data () {
    return {
      bordered: false,
      columns,
      rightcolumns,
      leftList: [],
      rightList: [],
      selectedKeys: [],
      orininalKeys: [],
      bmid: null,
      roleId: null,
      selectedRowKeys: [],
      rightselectedRowKeys: [],
      leftSelect: [],
      rightSelect: []
    }
  },
  props: {
    value: {
      type: Number,
      default: null
    }
  },
  mounted() {
    this.getRolePerson ()
  },
  methods: {
    onChange(e){
      const value = e.target.value.trim()
      if (value == '') {
        this.leftList = []
        this.selectedRowKeys = []
        return
      }
      const params = { 'value': value}
      getPersonList(params).then(response=>{
        if (response.code === 200){
          this.leftList = []
          this.selectedRowKeys = []
          const result = response.body
          this.leftList = this.leftList.concat(result)
        }
      }).catch(err=>{

      })
    },
    rowclick(keys){
      const bmid = keys
      this.getList(keys,this.value)
    },
    getList (keys,roleId) {
      if (keys == null) return
      this.bmid = keys[0]
      this.roleId = roleId
      const params = { 'bmdm': keys[0]}
      getRoleOrgPersonList(params).then(response => {
        this.leftList = []
        this.selectedRowKeys = []
        const result = response.body
        this.leftList = this.leftList.concat(result)
      }).catch(error => {
        console.log(error)
      })
    },
    getRolePerson () {
      const params = { 'roleId': this.value}
      getRolePersonList(params).then(response => {
        this.rightList = []
        const result = response.body
        this.rightList = this.rightList.concat(result)
        this.orininalKeys = this.orininalKeys.concat(result)
      }).catch(error => {
        console.log(error)
      })
    },
    onSelectChange(selectedRowKeys,selectedRows) {
      this.leftSelect = []
      this.selectedRowKeys = selectedRowKeys
      var leftSelect = []
      selectedRows.forEach( item => {
        var map = {
          'personId': item.personId,
          'personName': item.personName,
          'deptId': item.deptId
        }
        leftSelect.push(map)
      })
      this.leftSelect = this.leftSelect.concat(leftSelect)
    },
    onRightSelectChange(selectedRowKeys,selectedRows){
      this.rightSelect = []
      this.rightselectedRowKeys = selectedRowKeys
      var rightSelect = []
      selectedRows.forEach( item => {
        var map = {
          'personId': item.personId,
          'personName': item.personName,
          'deptId': item.deptId
        }
        rightSelect.push(map)
      })
      this.rightSelect = this.rightSelect.concat(rightSelect)
    },
    toSelect(){
      var newSelect = []
      var newList = []
      const leftSelect = [...this.leftSelect]
      this.rightList.forEach(item=>{
        newList.push(item.personId)
      })
      leftSelect.forEach(item=>{
        if(newList.indexOf(item.personId) == -1){
          var map = {
            'personId': item.personId,
            'personName': item.personName
          }
          newSelect.push(map)
        }
      })
      this.rightList = this.rightList.concat(newSelect)

      // for (var i=0;i<this.leftList.length;i++){
      //   const map = this.leftList[i]
      //   const personId = map['personId']
      //   if (this.selectedRowKeys.indexOf(personId)>-1){
      //     this.leftList.splice(i, 1);
      //     i--;
      //   }
      // }
      this.leftSelect = []
      this.selectedRowKeys = []
    },
    toCancel(){
      var newSelect = []
      const rightSelect = [...this.rightSelect]
      for(var j=0;j<this.rightList.length;j++){
        const map = this.rightList[j]
        const personId = map['personId']
        if (this.rightselectedRowKeys.indexOf(personId)>-1){
          this.rightList.splice(j, 1);
          j--;
        }
      }
      this.rightSelect = []
      this.rightselectedRowKeys = []
    },
    doSave () {
      const orininal = []
      const newList = []
      this.orininalKeys.forEach(item=>{
        orininal.push(item.personId)
      })
      this.rightList.forEach(item=>{
        newList.push(item.personId)
      })
      const params ={
        roleId: this.value,
        orininal: orininal,
        newList: newList
      }
      saveRolePerson(params).then(response => {
        const _this = this
        if (response.code === 200){
          _this.getRolePerson()
          _this.getList(this.bmid,this.roleId)
          _this.$notification['success']({
            message: '提示',
            description: '权限维护成功'
          })
        }else{
          _this.$notification['error']({
            message: '提示',
            description: '权限维护失败'
          })
        }
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-layout-header {
    height: 34px;
    /* padding: 0 50px; */
    line-height: 34px;
     background: white;
  }
</style>