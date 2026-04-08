# vue-editor-prose-kit

基于 Vue 3 + Tiptap 的富文本编辑器组件库。

## 功能

- 可配置工具栏（分组/按钮开关）
- 工具栏主题预设与权限控制
- 内置链接编辑面板
- 链接协议/域名白名单校验
- 图片上传适配接口（支持进度反馈与失败重试）
- 表格、任务列表、代码块高亮
- 内容安全清洗与粘贴白名单过滤（DOMPurify）
- 支持 `v-model`、事件回调和实例方法暴露

## 安装

```bash
npm install vue-editor-prose-kit
```

## Node 版本

- 推荐使用 `Node >= 20.19`（仓库内置 `.nvmrc` 为 `22`）

## 快速使用

```vue
<template>
  <VueEditor
    v-model="content"
    toolbar-theme="slate"
    :upload-image="uploadImage"
    :allowed-link-protocols="['https', 'mailto']"
    :link-domain-whitelist="['example.com']"
  />
</template>

<script setup>
import { ref } from "vue";
import { VueEditor } from "vue-editor-prose-kit";

const content = ref("<p>Hello editor</p>");

async function uploadImage(file, { onProgress }) {
  // 替换成你的上传逻辑，返回图片 URL
  onProgress(30);
  const arrayBuffer = await file.arrayBuffer();
  onProgress(100);
  void arrayBuffer;
  return "https://your-cdn.example.com/image.png";
}
</script>
```

## 本地开发

```bash
npm install
npm run build
npm run docs:dev
```

## Vercel 部署

```bash
# 预览环境部署
npm run vercel:deploy

# 生产环境部署
npm run vercel:deploy:prod
```

## 文档

- 本地文档服务: [http://localhost:5173](http://localhost:5173)
- 在线预览页面: `/guide/playground`
