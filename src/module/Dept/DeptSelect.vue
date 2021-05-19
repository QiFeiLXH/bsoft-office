<template>
  <a-tree-select
    :allowClear="true"
    placeholder="部门名称"
    :treeDefaultExpandAll="true"
    :treeData="deptList"
    :size="size"
    @change="onChange"
    @search="onSearch"
    :filterTreeNode="filterTreeNode"
    :value="value"
    :searchValue="searchValue"
    :dropdownStyle="{ maxHeight: '300px', overflow: 'auto' }"
    showSearch>
  </a-tree-select>
</template>

<script>
import { doLoadDeptSelect } from '@/api/projectGroup'
export default {
  name: 'DeptSelect',
  data () {
    return {
      deptList: [],
      value: undefined,
      searchValue: undefined,
      filterTreeNode: (inputValue, treeNode) => {
        var simpleCode = treeNode.data.props.simpleCode
        var deptName = treeNode.data.props.title
        if (deptName.indexOf(inputValue) > -1 || simpleCode.indexOf(inputValue.toUpperCase()) > -1) {
          return true
        }
      }
    }
  },
  props: {
    // 部门注销标志 ''为搜索全部 0为未注销 1未已注销
    logout: {
      type: String,
      default: '0'
    },
    size: {
      // 规格大小，default small large
      type: String,
      default: 'default'
    }
  },
  methods: {
    loadDeptSelect () {
      var param = { logout: this.logout }
      doLoadDeptSelect(param).then((res) => {
        if (res.code === 200) {
          this.deptList = res.body
        } else {
          this.$message.error(res.msg)
        }
      }).catch((res) => {
        console.log(res)
      })
    },
    onChange (e) {
      this.value = e
      this.$emit('setDept', e)
    },
    onSearch (e) {
      this.searchValue = e
    },
    resetDept () {
      this.value = undefined
      this.searchValue = undefined
    }
  },
  mounted () {
    this.loadDeptSelect()
  }
}
</script>

<style scoped>

</style>
