# 架构设计

## 目标

- 提供可扩展、可维护、可二次封装的富文本组件
- 在业务场景中保证编辑体验、输入稳定性和内容安全
- 保持 API 稳定，支持长期迭代

## 模块划分

1. 视图层（`VueEditor` 组件）
- 渲染工具栏、链接面板、图片面板、上传反馈
- 通过 props 暴露主题、权限、校验和白名单配置

2. 编辑器内核层（Tiptap + ProseMirror）
- 承载文档模型与命令系统
- 通过 Extension 机制扩展图片、链接、占位符和对齐能力

3. 输入治理层
- `uploadImage(file, { onProgress })`：负责上传进度、失败重试与插入
- `allowedLinkProtocols`、`linkDomainWhitelist`、`validateLink`：统一约束链接输入
- `pasteWhitelistTags`、`pasteWhitelistAttrs`、`pasteSanitizeOptions`：统一约束粘贴内容

4. 内容安全层
- `sanitize/sanitizeOptions`：负责初始化、外部写入和更新输出的内容清洗
- 默认禁止 `script/style/iframe` 和危险事件属性

## 数据流

1. 外部通过 `v-model` 传入 HTML
2. 组件在 set/update 阶段执行 `sanitize`
3. 粘贴 HTML 在进入编辑器前先执行粘贴白名单过滤
4. 链接在写入节点前执行协议、域名和自定义规则校验
5. 图片上传过程中通过 `onProgress` 反馈状态，成功后插入图片节点
6. 编辑器内容更新后触发 `update:modelValue`

## 扩展策略

- 内容扩展：表格、任务列表、代码高亮
- 互通扩展：Markdown 导入导出、HTML 规范化
- 交互扩展：Mention、Slash Command、协同评论
