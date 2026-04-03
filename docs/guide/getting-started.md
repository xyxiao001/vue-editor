# 快速开始

## 安装

```bash
npm install vue-editor-prose-kit
```

## 全量注册

```js
import { createApp } from "vue";
import App from "./App.vue";
import VueEditorComponent from "vue-editor-prose-kit";

createApp(App).use(VueEditorComponent).mount("#app");
```

## 按需引入

```js
import { VueEditor } from "vue-editor-prose-kit";
```

## 最小示例

```vue
<template>
  <VueEditor v-model="content" />
</template>

<script setup>
import { ref } from "vue";
import { VueEditor } from "vue-editor-prose-kit";

const content = ref("<p>Hello editor</p>");
</script>
```
