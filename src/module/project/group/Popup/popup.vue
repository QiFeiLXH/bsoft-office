<template>
  <transition name="dialog-fade">
    <div class="dialog-cover" v-show="visible" @click="close">
      <div class="dialog-content" :style="{top:topDistance+'px',width:widNum+'px',left:leftSite+'px'}">
        <div :style="{paddingTop:pdt+'px',paddingBottom:pdb+'px'}">
          <slot name="main"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Popup',
  data () {
    return {
      title: ''
    }
  },
  props: {
    visible: {
      // 弹窗组件是否显示 默认不显示
      type: Boolean,
      default: false,
      required: true // 必须
    },
    widNum: {
      // 内容宽度
      type: Number,
      default: 86.5
    },
    leftSite: {
      // 左定位
      type: Number,
      default: 6.5
    },
    topDistance: {
      // top上边距
      type: Number,
      default: 35
    },
    pdt: {
      // 上padding
      type: Number,
      default: 5
    },
    pdb: {
      // 下padding
      type: Number,
      default: 5
    }
  },
  methods: {
    close () {
      this.$emit('on-close')
    }
  }
}
</script>

<style scoped>
  .dialog-cover {
     background: rgba(120,120,120,0.55);
     position: fixed;
     z-index: 200;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
   }
   .dialog-content{
     position: fixed;
     top: 35%;
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;
     z-index: 5000;
     background-color: white;
   }
</style>
