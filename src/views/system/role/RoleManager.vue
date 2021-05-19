<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
    }"
  >
    <a-row :gutter="8">
      <a-col :span="10">
        <role-set
          @rowclick="rowclick">
        </role-set>
      </a-col>
      <a-col :span="14">
        <role-auth
          ref="authtable"
        >
        </role-auth>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import RoleSet from "@/module/Role/RoleSet/RoleSet"
import RoleAuth from "@/module/Role/RoleAuth/RoleAuth"

export default {
  name: 'RoleManager',
  components: {
    RoleSet,
    RoleAuth
  },
  data () {
    return {
      cardHeight: 0
    }
  },
  mounted(){
    this.cardHeight = window.innerHeight - 115
  },
  methods: {
    rowclick (record) {
      var roleId = null
      if (record != null){
        roleId = record.id
      }
      this.$refs.authtable.getList(roleId)
    }
  }
}
</script>

<style scoped>

</style>
