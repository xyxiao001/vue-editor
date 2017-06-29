<template>
  <div class="vue-editor">
    <div class="editor-control">
      <Icon
        v-for="(item, $index) in iconList"
        :name="item.name"
        :type="item.type"
        :icon="item.icon"
      >
        <div class="dropmenu" v-if="$index === 0">下拉菜单1</div>
      </Icon>
    </div>
    <div class="editor-body" contenteditable="true">
      <p><br></p>
    </div>
  </div>
</template>

<script>
import Icon from './icon'
export default {
  data: function () {
    return {
      iconList: [
        {
          // hover名字
          name: '标签',
          // 点击事件处理
          type: 'style',
          // 图标样式
          icon: 'icon-magic',
          // 是否有下拉菜单
          drop: true
        },
        {
          name: '粗体',
          type: 'bold',
          icon: 'icon-bold'
        },
        {
          name: '下划线',
          type: 'underline',
          icon: 'icon-underline'
        },
        {
          name: '清除样式',
          type: 'clear',
          icon: 'icon-xiangpi'
        },
        {
          name: '字体',
          type: 'fontFamily',
          icon: 'icon-char'
        }
      ]
    }
  },
  components: {
		Icon
	}
}
</script>

<style lang="css" scoped>
  @import "//at.alicdn.com/t/font_8e1zfc5tlz6ywrk9.css";

  .vue-editor {
    position: relative;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #a9a9a9;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .editor-control {
    display: flex;
    flex-flow: row wrap;
    height: 40px;
    color: #333;
    border-bottom: 1px solid transparent;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    background-color: #f5f5f5;
    border-color: #ddd;
  }

  .dropmenu {
    display: none;
    position: absolute;
    top: 32px;
    left: 0;
    z-index: 1000;
    min-width: 160px;
    padding: 5px 0;
    margin: 2px 0 0;
    font-size: 14px;
    text-align: left;
    list-style: none;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ccc;
    border: 1px solid rgba(0, 0, 0, .15);
    border-radius: 4px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
  }

  .editor-body {
    height: 300px;
    padding: 10px;
    color: #000;
    background-color: #fff;
    overflow: auto;
    outline: none;
  }

  .editor-body p {
    font-size: 14px;
    color: #68747f;
		margin: 0 0 10px;
  }
</style>
