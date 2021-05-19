<template>
  <div style="height: 350px;">
    <a-spin tip="数据加载缓慢,请耐心等待......" v-if="leftList.length <=0 " style="position:relative;top:50%;left:37%"></a-spin>
    <a-transfer
      v-else
      showSearch
      :rowKey="record => record.personId"
      :dataSource="leftList"
      :titles="['全部', '已选']"
      :operations="['选择', '取消']"
      :targetKeys="rightList"
      :selectedKeys="selectedKeys"
      @change="handleChange"
      @selectChange="handleSelectChange"
      :render="item=>`${item.personName}  -  ${item.deptName}`"
      @doSave="doSave"
      :listStyle="{ width: '325px', height: '350px' }"
    />
  </div>
</template>

<script>
import { getPersonList, getRolePersonList, saveRolePerson } from '@/api/person'
export default {
  name: 'PersonTransfer',
  data () {
    return {
      roleId: null,
      leftList: [],
      rightList: [],
      selectedKeys: [],
      orininalKeys: []
    }
  },
  props: {
    value: {
      type: Number,
      default: null
    }
  },
  mounted () {
    this.roleId = null
    this.leftList = []
    this.rightList = []
    this.selectedKeys = []
    this.orininalKeys = []
    this.getAllPerson()
    this.getRolePerson()
  },
  methods: {
    getAllPerson () {
      getPersonList().then(response => {
        this.leftList = []
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
    handleChange(nextTargetKeys, direction, moveKeys) {
      this.rightList = nextTargetKeys;
    },
    handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys]
    },
    doSave () {
      console.log('doSave')
      const params ={
        roleId: this.value,
        orininal: this.orininalKeys,
        new: this.rightList
      }
      saveRolePerson(params).then(response => {
        if (response.code === 200){
          const _this = this
          _this.$emit('closeModal')
        }else{

        }
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>

<style scoped>

</style>
