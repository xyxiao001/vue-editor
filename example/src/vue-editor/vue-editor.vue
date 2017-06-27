<template>
  <div class="vue-editor">
    <div class="editor-control">

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
  .vue-editor {
    position: relative;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #a9a9a9;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
  }

  .editor-control {
    height: 40px;
    color: #333;
    border-bottom: 1px solid transparent;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    background-color: #f5f5f5;
    border-color: #ddd;
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
