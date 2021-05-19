<template>
  <a-card :bordered="false" style="margin-top: 10px">
    <span v-if="isDynamicWorkLog" style="margin-left: 7px"><b>工作事件{{ title[titleIndex] }}</b></span>
    <span v-else><b>日志详情</b></span>
    <a-icon v-if="!(formDisabled || workLog.sourceType !== 2 || workLog.auditCount !== 0)" type="delete" style="float: right;margin-right: 20px" @click="deleteForm(titleIndex)"/>
    <img v-if="showStatus&&workLog.auditCount !== 0" src="~@/assets/audit.png" style="width: 80px;right:8%;position: absolute;"/>
    <a-form :form="form" hideRequiredMark>
      <a-form-item
        label="范围"
        :labelCol="{lg: {span: 3}, sm: {span: 2}}"
        :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
        :required="false"
        style="margin-bottom: 0"
      >
        <a-radio-group  v-decorator="['range', {rules: [{required: true, message: '请选择范围' }],initialValue: range }]" v-if="finished">
          <a-radio disabled :value="1" >合同内</a-radio>
          <a-radio disabled :value="2" >合同外</a-radio>
        </a-radio-group>
        <a-radio-group v-decorator="['range', {rules: [{required: true, message: '请选择范围' }],initialValue: range }]" v-else-if="(range === null && !showName)||(range === null && workLog.plan === 2)">
          <a-radio :value="1">合同内</a-radio>
          <a-radio :value="2">合同外</a-radio>
        </a-radio-group>
        <a-radio-group v-decorator="['range', {initialValue: range }]" v-else>
          <a-radio :disabled="range !== 1" :value="1">合同内</a-radio>
          <a-radio :disabled="range !== 2" :value="2">合同外</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        label="计划"
        :labelCol="{lg: {span: 3}, sm: {span: 2}}"
        :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
        :required="false"
        style="margin-bottom: 0"
      >
        <a-radio-group v-decorator="['plan', { initialValue:workLog.plan }]" v-if="finished">
          <a-radio disabled :value="1">计划内</a-radio>
          <span v-if="showPlanName !== ''">
            <span style="color: #f5222d" v-if="showPlanName === '请选择左侧项目计划'">{{ showPlanName }}</span>
            <a-tag color="#87d068" v-else-if="showTipTag&&showPlanName.length < 20">{{ showPlanName }}</a-tag>
            <a-tooltip placement="top" v-else-if="showTipTag">
              <template slot="title">
                <span>{{ showPlanName }}</span>
              </template>
              <a-tag color="#87d068">{{ showPlanName.substring(0,20)+'...'}}</a-tag>
            </a-tooltip>
          </span>
          <a-radio style="position: absolute;left: 360px;bottom: -1px" disabled :value="2">计划外</a-radio>
        </a-radio-group>
        <a-radio-group v-decorator="['plan', { initialValue:workLog.plan }]" @change="changePlanValue" v-else>
          <a-radio :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled || workLog.milepostId === -1)&&workLog.plan !== 1" :value="1">计划内</a-radio>
          <span v-if="showPlanName !== ''">
            <span style="color: #f5222d" v-if="showPlanName === '请选择左侧项目计划'">{{ showPlanName }}</span>
            <a-tag color="#87d068" v-else-if="showTipTag&&showPlanName.length < 20">{{ showPlanName }}</a-tag>
            <a-tooltip placement="top" v-else-if="showTipTag">
              <template slot="title">
                <span>{{ showPlanName }}</span>
              </template>
              <a-tag color="#87d068">{{ showPlanName.substring(0,20)+'...'}}</a-tag>
            </a-tooltip>
          </span>
          <a-radio style="position: absolute;left: 360px;bottom: -1px" :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled || workLog.milepostId === -1)&&workLog.plan !== 2" :value="2">计划外</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        label="角色"
        :labelCol="{lg: {span: 3}, sm: {span: 2}}"
        :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
        :required="false"
        style="margin-bottom: 0"
      >
        <a-radio-group v-decorator="['role', {rules: [{required: true, message: '请选择角色' }], initialValue:workLog.role}]">
          <a-radio-button :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled)&& workLog.role !== item.id" :value="item.id" v-for="(item,index) in roles" :key="item.id">{{item.name}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        label="方式"
        :labelCol="{lg: {span: 3}, sm: {span: 2}}"
        :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
        :required="false"
        style="margin-bottom: 0"
      >
        <a-radio-group v-decorator="['model', {rules: [{required: true, message: '请选择方式' }], initialValue:workLog.model }]">
          <a-radio :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled)&& workLog.model !== 1" :value="1" style="margin-right: 23px">现场</a-radio>
          <a-radio :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled)&& workLog.model !== 2" :value="2" style="margin-right: 23px">远程</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        label="类别"
        :labelCol="{lg: {span: 3}, sm: {span: 2}}"
        :wrapperCol="{lg: {span: 21}, sm: {span: 20} }"
        :required="false"
        style="margin-bottom: 0"
      >
        <a-radio-group v-decorator="['type', {rules: [{required: true, message: '请选择类别' }], initialValue:workLog.type }]" >
          <a-radio-button :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled)&& workLog.type !== item.id" :value="item.id" v-for="(item,index) in types" :key="item.id">{{item.name}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        label="内容"
        :labelCol="{lg: {span: 3}, sm: {span: 2}}"
        :wrapperCol="{lg: {span: 20}, sm: {span: 20} }"
        style="margin-bottom: 0">
        <a-textarea
          rows="4"
          @change="workLogChange"
          v-decorator="[
            'workLog',
            {rules: [{required: true, message: '请输入事件' }],initialValue:workLog.workLog}
          ]"
          :readOnly="formDisabled || workLog.sourceType !== 2 || workLog.auditCount !== 0"/>
      </a-form-item>
      <div style="height: 15px;margin-right: 5%">
        <span style="float: right;font-size: small;color: #000000a6">{{workLogCount}}/300字</span>
      </div>
      <a-row>
        <a-col span="12">
          <a-form-item
            label="工时"
            :labelCol="{lg: {span: 6}, sm: {span: 2}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 22} }"
            :required="false"
            style="margin-bottom: 0"
          >
            <a-input v-if="formDisabled || workLog.sourceType !== 2 || workLog.auditCount !== 0" :readOnly="true" v-decorator="['workload', {rules: [{required: true, message: '请填写工时' }], initialValue:workLog.workload }]"  style="width:88px"/>
            <a-input-number v-else :min="0.1" :precision="1" :max="24" v-decorator="['workload', {rules: [{required: true, message: '请填写工时' }], initialValue:workLog.workload }]"/>&nbsp;h
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item
            label="事件结果"
            :labelCol="{lg: {span: 6}, sm: {span: 6}}"
            :wrapperCol="{lg: {span: 18}, sm: {span: 18} }"
            :required="false"
            style="margin-bottom: 0"
          >
            <a-radio-group v-decorator="['result',{rules: [{required: true, message: '请选择事件结果' }],initialValue:workLog.result}]">
              <a-radio :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled)&& workLog.result !== 0" :value="0">进行中</a-radio>
              <a-radio :disabled="(workLog.sourceType !== 2 || workLog.auditCount !== 0 || formDisabled)&& workLog.result !== 1" :value="1">已完成</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['id', { initialValue:workLog.id }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['attendanceId', { initialValue:workLog.attendanceId }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['milepostId', { initialValue:workLog.milepostId }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['workLogId', { initialValue:workLog.workLogId }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['submitter', { initialValue:workLog.submitter }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['auditType', { initialValue:workLog.auditType }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['attendanceDate', { initialValue:workLog.attendanceDate }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['auditCount', { initialValue:workLog.auditCount }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['technumid', { initialValue:workLog.technumid }]"/>
      </a-form-item>
      <a-form-item hidden>
        <a-input-number disabled v-decorator="['sourceType', { initialValue:workLog.sourceType }]"/>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
  export default {
    name: 'WorkLogInfo',
    props: {
      titleIndex: {
        type: Number,
        default: 0,
        required: false
      },
      planName: {
        type: String,
        default: '',
        required: true
      },
      workLog: {
        type: Object,
        default: null
      },
      formDisabled: {
        type: Boolean,
        default: true
      },
      showTipTag: {
        type: Boolean,
        default: true
      },
      isDynamicWorkLog: {
        type: Boolean,
        default: true
      },
      showStatus: {
        type: Boolean,
        default: false
      },
      roles: {
        type: Array,
        required: true
      },
      types: {
        type: Array,
        required: true
      },
      finished: {
        type: Boolean,
        default: false,
        required: false
      },
    },
    data () {
      return {
        title: ['一', '二', '三', '四', '五', '六', '七', '八', '九',
          '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '二十二', '二十三', '二十四'],
        form: this.$form.createForm(this),
        showName: true,
        workLogCount: this.workLog.workLog.length
      }
    },
    computed: {
      showPlanName: function () {
        return this.showName ? this.planName === '计划外' ? '' : this.planName : ''
      },
      range: function () {
        return this.showName ? this.workLog.range : null
      }
    },
    methods: {
      deleteForm (index) {
        this.$emit('deleteWorkLog', index)
      },
      changePlanValue (e) {
        if(e.target.value !== 2){//计划内
          this.showName = true
          this.form.setFieldsValue({ range: this.workLog.range })
        }else{
          this.showName = false
          this.form.setFieldsValue({ range: null })
        }
      },
      workLogChange (e) {
        if(e.target.value.length <= 300){
          this.workLogCount = e.target.value.length
        }else{
          this.workLogCount = 300
          e.target.value = e.target.value.substring(0,300)
        }
      }

    }
  }
</script>

<style scoped>

</style>
