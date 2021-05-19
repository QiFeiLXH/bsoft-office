<template>
  <a-modal
    title="编辑分组"
    :width="640"
    :closable="false"
    :visible="visible"
    :confirmLoading="confirmLoading"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          label="分组名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="[
            'title',
            {rules: [{ required: true, message: '填写分组名称!'}],initialValue:groupData.title}
          ]"/>
        </a-form-item>
      </a-form>
    </a-spin>
    <template slot="footer">
      <a-button key="submit" type="primary" @click="handleSubmit">
        确定
      </a-button>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
  </a-modal>
</template>

<script>
export default {
  data () {
    return {
      title: '',
      groupData:{},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      },
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this)
    }
  },
  created () {
    this.title = ''
  },
  methods: {
    add (groupData,op) {
      this.form.resetFields()
      if(op === 'edit'){
        this.groupData = groupData
      }else if (op === 'addChild'){
        this.groupData.parentId = groupData.key
        this.groupData.key = null
        this.groupData.title = null
      }else if(op === 'add'){
        this.groupData.parentId = groupData.parentId
        this.groupData.key = null
        this.groupData.title = null
      }
      this.visible = true
    },
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          this.groupData.title = values.title
          setTimeout(() => {
            this.visible = false
            this.confirmLoading = false
            this.$emit('ok', this.groupData)
          }, 100)
        }
      });
    },
    handleCancel () {
      this.visible = false
    }
  }
}
</script>
