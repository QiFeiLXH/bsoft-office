<template>
  <a-layout>
    <a-layout-content :style="{ overflow: 'auto', height: '350px',background: '#fff',padding: '0'}">
      <a-tree
        @expand="onExpand"
        :treeData="gData"
        @select="onselect"
        :expandedKeys="expandedKeys"
        :replaceFields="{children:'children', title:'title', key:'value' }"
      >
      </a-tree>
    </a-layout-content>
  </a-layout>
</template>

<script>
import { getDeptTree } from '@/api/common'
export default {
  name: "DeptTree",
  data () {
    return {
      gData: [],
      expandedKeys: []
    }
  },
  mounted() {
    this.gData = []
    this.getList()
  },
  methods: {
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
    },
    getList(){
      let param={logout:"0"}
      getDeptTree(param).then(res => {
        if (res.code === 200){
          this.gData = this.gData.concat(res.body)
        }
      }).catch(err => {

      })
    },
    onselect(keys) {
      const _this = this
      _this.$emit('rowclick',keys)
    },
    // onChange(e) {
    //   const value = e.target.value.trim()
    //   this.value = value
      // this.filterTree(value,this.gData)
      // this.deleteRepeat(this.newgData)
    // },
    // filterTree(value,gData){
    //   return gData.filter(item => {
    //     if (item.title.indexOf(value) > -1 || item.simpleCode.toLowerCase().indexOf(value.toLowerCase()) > -1){
    //       this.newgData.push(item)
    //       return item
    //     }
    //     if (item.children.length > 0 && (item.title.indexOf(value) <= -1 && item.simpleCode.toLowerCase().indexOf(value.toLowerCase()) <= -1)){
    //       item.children.filter(item2 =>{
    //         if (item2.title.indexOf(value) > -1 || item2.simpleCode.toLowerCase().indexOf(value.toLowerCase()) > -1){
    //           this.newgData.push(item)
    //           return item2
    //         }
    //       })
    //     }
    //   }).map(item => {
    //     item = Object.assign({}, item)
    //     if (item.children.length > 0) {
    //       item.children = this.filterTree(value,item.children)
    //       return item
    //     }
    //   })
    // },
    // deleteRepeat(newgData){
    //   const returnData = []
    //   this.searchgData = []
    //   for(var i=0;i<newgData.length;i++){
    //     if (returnData.indexOf(newgData[i]) == -1){
    //       returnData.push(newgData[i])
    //     }
    //   }
    //   this.searchgData = this.searchgData.concat(returnData)
    // }
  }
}
</script>

<style lang="less" scoped>
  .ant-layout-header {
    height: 44px;
    padding: 0;
    line-height: 44px;
    background: #ffffff !important;
  }
</style>