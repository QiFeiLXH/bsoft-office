<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
    }"
  >
    <a-row :gutter="8">
      <a-col :span="8">
        <a-card :bordered="false" :body-style="{padding: 0}">
          <menu-tree
            ref="menuTree"
            @rowclick="rowclick"
          ></menu-tree>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card :bordered="false" :body-style="{padding: 0}">
          <menu-form
            ref="menuForm"
            @formrowclick="formrowclick"
          ></menu-form>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import MenuTree from "@/module/menu/MenuTree/MenuTree"
import MenuForm from "@/module/menu/MenuForm/MenuForm"

export default {
  name: 'Menu',
  components: {
    MenuTree,
    MenuForm
  },
  data () {
    return {
      cardHeight: 0,
      systemid: 0
    }
  },
  mounted(){
    this.cardHeight = window.innerHeight - 115
  },
  methods: {
    rowclick (record, flag, systemid) {
      this.systemid = systemid
      this.$refs.menuForm.loadData(record, flag, systemid)
    },
    formrowclick (systemid) {
      this.$refs.menuTree.getList(systemid)
    }
  }
}
</script>

<style scoped>

</style>
