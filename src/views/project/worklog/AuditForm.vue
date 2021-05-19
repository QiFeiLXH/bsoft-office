<template>
  <a-modal
    :title="'审核意见 - '+flagText"
    :width="640"
    :closable="false"
    :visible="visible"
    :confirmLoading="confirmLoading"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          label="意见说明"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
<!--          <a-input v-decorator="['desc', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />-->
          <a-textarea v-model="remark" v-if="flag == 1" style="height: 100px"/>
          <a-textarea v-if="flag == 2" style="height: 100px"  v-decorator="[
            'remark',
            {rules: [{ required: true, message: '不同意请填写意见!' }]}
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
      flagText: '',
      flag: 0,
      remark: '',
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
    this.remark = ''
  },
  methods: {
    add (flag) {
      if (flag === 1) {
        this.flagText = '同意'
        this.flag = 1
      } else {
        this.flagText = '不同意'
        this.flag = 2
      }
      this.form.resetFields()
      this.remark = null
      this.visible = true
    },
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          const data = {
            flag: this.flag,
            remark: values.remark
          }
          setTimeout(() => {
            this.visible = false
            this.confirmLoading = false
            this.$emit('ok', data)
          }, 1500)
        }
      });
    },
    handleCancel () {
      this.visible = false
    }
  }
}
</script>
