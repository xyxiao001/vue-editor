# 架构设计

## 目标

- 提供可扩展、可维护、可二次封装的富文本组件
- 在业务场景中保证编辑体验与内容安全
- 保持 API 稳定，支持长期迭代

## 模块划分

1. 视图层（VueEditor 组件）
- 渲染编辑器容器、工具栏、链接面板
- 暴露标准 props/events/expose

2. 编辑器内核层（Tiptap + ProseMirror）
- 承载文档模型与命令系统
- 通过 Extension 机制扩展能力

3. 能力适配层
- `uploadImage(file)`：与 OSS/S3/自建服务对接
- `sanitize/sanitizeOptions`：内容输入与粘贴清洗
- `toolbar/messages/locale`：UI 配置和多语言扩展

## 数据流

1. 外部通过 `v-model` 传入 HTML
2. 组件在 set/update/paste 阶段执行 sanitize
3. 编辑器内容更新后触发 `update:modelValue`
4. 业务方可通过 `ready` 获取 editor 实例做增强

## 安全策略

- 默认开启 DOMPurify
- 默认禁止 `script/style/iframe` 和内联事件属性
- 粘贴 HTML 进入编辑器前做统一清洗
- 建议服务端再次做白名单过滤

## 扩展建议

- 上传插件：图片压缩、重试、进度、鉴权
- 内容插件：表格、任务列表、代码高亮、Markdown
- 协作插件：Yjs 实时协作、评论、版本追踪
