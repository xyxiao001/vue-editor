<template>
  <div class="editor-item">
    <button class="item-icon" :class="{'activity': choose}" :data-info="name" :data-type="type" @click="iconClick($event, type)">
      <i class="iconfont" :class="icon" v-if="icon.length > 0"></i>
    </button>
    <slot></slot>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
    }
  },
  props: {
    name: {
      type: String,
      default: '未定义'
    },
    type: {
      type: String,
      default: '未定义'
    },
    icon: {
      type: String,
      default: '未定义'
    },
    choose: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    iconClick (event, type) {
      this.$emit('iconClick', event, type)
    }
  }
}
</script>

<style lang="css" scoped>

  .editor-item {
    position: relative;
    vertical-align: middle;
    border: 1px solid #ccc;
    cursor: pointer;
    line-height: 20px;
    border-radius: 3px;
    margin: 4px 0 4px 5px;
    background-color: white;
  }

  .editor-item .item-icon {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
    padding: 2px 10px;
    font-size: 18px;
    font-weight: normal;
    white-space: nowrap;
    vertical-align: middle;
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
    background-color: #fff;
    border: 1px solid white;
    outline: none;
    transition: all 0.1s ease-out;
  }

  .editor-item .item-icon:after {
    position: absolute;
    top: 0;
    content: attr(data-info);
    top: 40px;
    left: 20px;
    padding: 5px 8px;
    border-radius: 4px;
    white-space: nowrap;
    line-height: 1.5;
    font-size: 13px;
    color: #fff;
    background: rgba(0,0,0,.8);
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    visibility: hidden;
    opacity: .9;
    letter-spacing: 1px;
    z-index: 9999;
  }

  .editor-item .item-icon:before {
    position: absolute;
    content: "";
    top: 35px;
    left: 20px;
    width: 0;
    height: 0;
    margin: 0 0 0 -6px;
    font-size: 0;
    color: rgba(0,0,0,.8);
    border-bottom: 6px solid currentColor;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    visibility: hidden;
    opacity: .9;
    z-index: 9999;
  }

  .item-icon:hover, .item-icon.activity{
    color: #333;
    background-color: #e6e6e6;
    border-color: #e6e6e6;
  }

  .editor-item .item-icon:hover:after, .editor-item .item-icon:hover:before {
    visibility: visible;
  }

  .item-icon.activity + .dropmenu {
    display: block;
  }
</style>
