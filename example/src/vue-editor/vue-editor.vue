<template>
  <div class="vue-editor">
    <div class="editor-control">
      <div class="editor-item" data-info="标签">
        <i class="iconfont icon-magic"></i>
      </div>
    </div>
    <div class="editor-body" contenteditable="true">
      <p><br></p>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
    }
  }
}
</script>

<style lang="css" scoped>
  @import "//at.alicdn.com/t/font_xfj36ibcszynl8fr.css";

  .vue-editor {
    position: relative;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #a9a9a9;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
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

  .editor-item {
    vertical-align: middle;
    border: 1px solid #ccc;
    cursor: pointer;
    padding: 5px 10px;
    line-height: 20px;
    border-radius: 3px;
    margin: 4px 0 4px 5px;
    background-color: white;
  }

  .editor-item:after {
    position: absolute;
    top: 0;
    content: attr(data-info);
    top: 40px;
    left: 25px;
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
  }

  .editor-item:before {
    position: absolute;
    content: "";
    top: 35px;
    left: 25px;
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
  }

  .editor-item:hover {
    color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
  }

  .editor-item:hover:after, .editor-item:hover:before {
    visibility: visible;
  }

  .editor-item i {
    font-size: 18px;
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
