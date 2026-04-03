import { defineConfig } from "vitepress";

export default defineConfig({
  title: "vue-editor-prose-kit",
  description: "Vue 3 富文本编辑器组件库文档",
  themeConfig: {
    nav: [
      { text: "指南", link: "/guide/getting-started" },
      { text: "在线预览", link: "/guide/playground" },
      { text: "用法", link: "/guide/usage" },
      { text: "架构", link: "/guide/architecture" },
      { text: "路线图", link: "/guide/roadmap" },
    ],
    sidebar: [
      {
        text: "文档",
        items: [
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "在线预览", link: "/guide/playground" },
          { text: "组件用法", link: "/guide/usage" },
          { text: "API 说明", link: "/guide/api" },
          { text: "架构设计", link: "/guide/architecture" },
          { text: "实现路线图", link: "/guide/roadmap" },
        ],
      },
    ],
  },
});
