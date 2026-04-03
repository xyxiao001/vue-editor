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
| `uploadImage` | `(file: File) => Promise<string>` | `null` | 图片上传适配器，返回图片 URL |
| `sanitize` | `boolean` | `true` | 是否启用内容清洗 |
| `sanitizeOptions` | `object` | 内置安全策略 | DOMPurify 配置 |
| `linkTarget` | `string` | `"_blank"` | 链接 target |
| `linkRel` | `string` | `"noopener noreferrer nofollow"` | 链接 rel |

## 默认 toolbar

```js
[
  ["blockType"],
  ["bold", "italic", "underline", "strike", "highlight"],
  ["bulletList", "orderedList", "horizontalRule"],
  ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
  ["link", "image"],
  ["clearFormatting", "undo", "redo"],
]
```

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `(html: string)` | 内容更新时触发 |
| `focus` | `(event: FocusEvent)` | 编辑区获得焦点 |
| `blur` | `(event: FocusEvent)` | 编辑区失去焦点 |
| `ready` | `(editor: Editor)` | 编辑器实例就绪 |
| `image-upload-error` | `(error: unknown)` | 图片上传失败 |

## Expose

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `getHTML()` | `string` | 获取 HTML |
| `getJSON()` | `JSON` | 获取 ProseMirror JSON |
| `setHTML(content)` | `void` | 设置 HTML |
| `clear()` | `void` | 清空内容 |
| `focus()` | `void` | 聚焦编辑器 |
