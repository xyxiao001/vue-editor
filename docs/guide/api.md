# API 说明

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `""` | 编辑器 HTML 内容 |
| `placeholder` | `string` | `"开始输入内容..."` | 空内容提示 |
| `editable` | `boolean` | `true` | 是否可编辑 |
| `minHeight` | `number \| string` | `280` | 编辑区域最小高度 |
| `locale` | `"zh-CN" \| "en-US" \| string` | `"zh-CN"` | 工具栏文案语言 |
| `messages` | `Record<string, string>` | `{}` | 自定义文案，覆盖内置语言包 |
| `toolbar` | `string[] \| string[][]` | 见默认配置 | 工具栏按钮配置 |
| `toolbarPermissions` | `Record<string, boolean \| "hidden" \| "disabled">` | `{}` | 按钮权限控制，`false/hidden` 为隐藏，`disabled` 为展示但禁用 |
| `toolbarTheme` | `"light" \| "slate" \| "sand" \| Record<string, string>` | `"light"` | 工具栏主题预设，或传入主题变量对象 |
| `uploadImage` | `(file: File, context: { onProgress: (value: number) => void }) => Promise<string \| { url: string }>` | `null` | 图片上传适配器，支持进度上报 |
| `sanitize` | `boolean` | `true` | 是否启用内容清洗 |
| `sanitizeOptions` | `object` | 内置安全策略 | DOMPurify 全局配置 |
| `pasteWhitelistTags` | `string[]` | 内置白名单 | 粘贴时允许保留的标签 |
| `pasteWhitelistAttrs` | `string[]` | 内置白名单 | 粘贴时允许保留的属性 |
| `pasteSanitizeOptions` | `object` | `{}` | 粘贴专用 DOMPurify 配置，会与白名单配置合并 |
| `linkTarget` | `string` | `"_blank"` | 链接 target |
| `linkRel` | `string` | `"noopener noreferrer nofollow"` | 链接 rel |
| `allowedLinkProtocols` | `string[]` | `["http", "https", "mailto", "tel"]` | 允许的链接协议 |
| `linkDomainWhitelist` | `string[]` | `[]` | 允许的链接域名白名单，支持匹配子域名 |
| `validateLink` | `(payload) => boolean \| string` | `null` | 自定义链接校验，返回 `false` 或错误文案时阻止写入 |

## 默认 toolbar

```js
[
  ["blockType"],
  ["bold", "italic", "underline", "strike", "highlight"],
  ["bulletList", "orderedList", "taskList", "horizontalRule"],
  ["table"],
  ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
  ["link", "image"],
  ["clearFormatting", "undo", "redo"],
]
```

新增按钮关键字：

- `taskList`
- `table`

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `(html: string)` | 内容更新时触发 |
| `focus` | `(event: FocusEvent)` | 编辑区获得焦点 |
| `blur` | `(event: FocusEvent)` | 编辑区失去焦点 |
| `ready` | `(editor: Editor)` | 编辑器实例就绪 |
| `image-upload-start` | `(file: File)` | 图片上传开始 |
| `image-upload-progress` | `(progress: number)` | 图片上传进度变化 |
| `image-upload-success` | `(src: string)` | 图片上传成功并插入编辑器 |
| `image-upload-error` | `(error: unknown)` | 图片上传失败 |

## Expose

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `getHTML()` | `string` | 获取 HTML |
| `getJSON()` | `JSON` | 获取 ProseMirror JSON |
| `setHTML(content)` | `void` | 设置 HTML |
| `clear()` | `void` | 清空内容 |
| `focus()` | `void` | 聚焦编辑器 |
| `retryLastImageUpload()` | `Promise<void>` | 重新执行最近一次失败的图片上传 |

## 主题对象字段

当 `toolbarTheme` 传入对象时，可以按需覆盖以下字段：

```js
{
  borderColor: "#dcdfe6",
  toolbarBackground: "#f8fafc",
  toolbarBorder: "#ebeef5",
  groupBorder: "#e5e7eb",
  panelBackground: "#f8fafc",
  buttonBackground: "#ffffff",
  buttonBorder: "#d1d5db",
  buttonText: "#1f2937",
  buttonHoverBorder: "#9ca3af",
  buttonActiveBackground: "#eff6ff",
  buttonActiveBorder: "#2563eb",
  buttonActiveText: "#1d4ed8",
  primaryBackground: "#2563eb",
  primaryText: "#ffffff",
}
```
