# 组件用法

```vue
<template>
  <VueEditor
    ref="editorRef"
    v-model="content"
    locale="zh-CN"
    :editable="editable"
    :toolbar="toolbar"
    :toolbar-permissions="toolbarPermissions"
    :toolbar-theme="toolbarTheme"
    :upload-image="uploadImage"
    :sanitize="true"
    :paste-whitelist-tags="pasteWhitelistTags"
    :paste-whitelist-attrs="pasteWhitelistAttrs"
    :allowed-link-protocols="['https', 'mailto']"
    :link-domain-whitelist="['example.com', 'openai.com']"
    :validate-link="validateLink"
    :min-height="320"
    placeholder="请输入正文"
    @ready="onReady"
    @image-upload-progress="onImageUploadProgress"
    @image-upload-error="onImageUploadError"
  />

  <button @click="editorRef?.focus()">聚焦</button>
  <button @click="editorRef?.clear()">清空</button>
  <button @click="editorRef?.retryLastImageUpload()">重试最近一次上传</button>

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
  ["bulletList", "orderedList", "taskList"],
  ["table"],
  ["link", "image"],
  ["undo", "redo"],
];

const toolbarPermissions = {
  clearFormatting: false,
  link: "disabled",
};

const toolbarTheme = "slate";

const pasteWhitelistTags = ["a", "blockquote", "br", "code", "col", "colgroup", "em", "h1", "h2", "h3", "hr", "img", "input", "label", "li", "ol", "p", "pre", "strong", "table", "tbody", "td", "th", "thead", "tr", "u", "ul"];
const pasteWhitelistAttrs = ["alt", "checked", "class", "colspan", "data-checked", "data-float", "data-type", "data-width", "href", "rel", "rowspan", "src", "target", "title", "type"];

async function uploadImage(file, context) {
  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();

  return await new Promise((resolve, reject) => {
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      context.onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.url);
        return;
      }

      reject(new Error("upload failed"));
    };

    xhr.onerror = () => reject(new Error("network error"));
    xhr.send(formData);
  });
}

function validateLink({ normalizedUrl, hostname }) {
  if (normalizedUrl.includes("debug=true")) {
    return "链接中不允许携带 debug 参数";
  }

  return hostname !== "blocked.example.com";
}

function onReady(editor) {
  console.log("editor ready", editor);
}

function onImageUploadProgress(progress) {
  console.log("upload progress", progress);
}

function onImageUploadError(error) {
  console.error("upload error", error);
}
</script>
```
