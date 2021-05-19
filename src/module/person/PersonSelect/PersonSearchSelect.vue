<template>
  <a-auto-complete
    :size="size"
    showSearch
    @focus="handleFoucs"
    @search="handleInputChange"
    @keyup.enter.native="personSelectSearch"
    @select="handlePersonSelect"
    :defaultActiveFirstOption="false"
    :value="personNameSelected"
    :disabled="disabled"
    placeholder="姓名"
    optionLabelProp="text"
    :dropdownMatchSelectWidth="false"
    :dropdownStyle="{width: '300px'}"
    :class="styleClass">
    <template slot="dataSource">
      <a-select-option v-for="item in personSelectList" :key="item.personId" :text="item.personName">
        <a-row>
          <a-col :span="15">
            {{ item.deptName}}
          </a-col>
          <a-col :span="9">
            {{ item.personName}}
          </a-col>
        </a-row>
      </a-select-option>
    </template>
  </a-auto-complete>
</template>

<script>
import { findPersonSelectList } from '@/api/common'

export default {
  name: 'PersonSearchSelect',
  data () {
    return {
      personNameSelected: undefined,
      personSelectList: [],
      selectedRow: ''
    }
  },
  props: {
    personName: {
      type: String,
      default: undefined
    },
    size: {
      // 人员选择组件大小 'small' 'large'
      type: String,
      default: 'small'
    },
    styleClass: {
      // 类class
      type: String,
      default: ''
    },
    disabled: {
      // 不可选状态
      type: Boolean,
      default: false
    }
  },
  methods: {
    personSelectSearch () {
      if (!this.personNameSelected) {
        return
      }
      var params = { simpleCode: this.personNameSelected }
      findPersonSelectList(params).then((res) => {
        if (res.code === 200) {
          if (res.body != null || res.body !== undefined) {
            this.personSelectList = res.body
          }
        } else {
          this.$message.error(res.msg)
        }
      }).catch((res) => {
        console.log(res)
      })
    },
    handlePersonSelect (val) {
      var record = this.personSelectList.find(item => item.personId === val)
      this.personNameSelected = val
      this.$emit('setPerson', record)
    },
    init () {
      this.personNameSelected = this.personName
    },
    handleInputChange (value) {
      this.personNameSelected = value
    },
    handleFoucs () {
      this.personSelectList = []
    }
  },
  mounted () {
    this.init()
  }

}
</script>

<style lang="less" scoped>

</style>
