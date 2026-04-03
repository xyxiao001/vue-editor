# 组件用法

```vue
<template>
  <VueEditor
    ref="editorRef"
    v-model="content"
    locale="zh-CN"
    :editable="editable"
    :toolbar="toolbar"
    :upload-image="uploadImage"
    :sanitize="true"
    :min-height="320"
    placeholder="请输入正文"
    @ready="onReady"
    @focus="onFocus"
    @blur="onBlur"
    @image-upload-error="onImageUploadError"
  />

  <button @click="editorRef?.focus()">聚焦</button>
  <button @click="editorRef?.clear()">清空</button>

  <pre>{{ content }}</pre>
</template>

<script setup>
import { ref } from "vue";
import { VueEditor } from "vue-editor-prose-kit";

const editorRef = ref(null);
const editable = ref(true);
const content = ref("<p>欢迎使用富文本编辑器</p>");

const toolbar = [
  ["blockType"],
  ["bold", "italic", "underline", "highlight"],
  ["bulletList", "orderedList"],
  ["link", "image"],
  ["undo", "redo"],
];

async function uploadImage(file) {
  // 替换成你的上传逻辑：返回可访问 URL
  const data = await file.arrayBuffer();
  void data;
  return "https://your-cdn.example.com/path/to/image.png";
}

function onReady(editor) {
  console.log("editor ready", editor);
}

function onFocus(event) {
  console.log("focus", event);
}

function onBlur(event) {
  console.log("blur", event);
}

function onImageUploadError(error) {
  console.error("upload error", error);
}
</script>
```
