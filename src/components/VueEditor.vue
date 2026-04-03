<template>
  <div class="vue-editor" :class="{ 'is-disabled': !editable }">
    <div v-if="normalizedToolbar.length" class="editor-toolbar" role="toolbar" aria-label="Editor Toolbar">
      <div v-for="(group, groupIndex) in normalizedToolbar" :key="`group-${groupIndex}`" class="toolbar-group">
        <template v-for="item in group" :key="item">
          <label v-if="item === 'blockType'" class="sr-only" for="editor-block-type">{{ t("blockType") }}</label>
          <select
            v-if="item === 'blockType'"
            id="editor-block-type"
            class="toolbar-select"
            :value="blockType"
            :disabled="!editable"
            @change="changeBlockType"
          >
            <option value="paragraph">{{ t("paragraph") }}</option>
            <option value="heading-1">{{ t("heading1") }}</option>
            <option value="heading-2">{{ t("heading2") }}</option>
            <option value="heading-3">{{ t("heading3") }}</option>
            <option value="blockquote">{{ t("blockquote") }}</option>
            <option value="codeBlock">{{ t("codeBlock") }}</option>
          </select>

          <button
            v-else
            type="button"
            class="toolbar-btn"
            :class="{ active: isButtonActive(item) }"
            :title="t(item)"
            :data-tooltip="t(item)"
            :disabled="isButtonDisabled(item)"
            @click="handleToolbarAction(item)"
          >
            <span class="btn-icon" aria-hidden="true">{{ iconOf(item) }}</span>
            <span class="sr-only">{{ t(item) }}</span>
          </button>
        </template>
      </div>
    </div>

    <div v-if="showLinkEditor" class="link-editor">
      <input
        v-model="linkUrl"
        class="link-input"
        type="url"
        :placeholder="t('linkPlaceholder')"
        @keydown.enter.prevent="applyLink"
        @keydown.esc.prevent="closeLinkEditor"
      />
      <button type="button" class="link-btn primary" @click="applyLink">{{ t("apply") }}</button>
      <button type="button" class="link-btn" @click="removeLink">{{ t("remove") }}</button>
      <button type="button" class="link-btn" @click="closeLinkEditor">{{ t("cancel") }}</button>
    </div>

    <div v-if="showImageEditor" class="image-editor">
      <div class="image-editor-row">
        <span class="image-editor-label">{{ t("imageWidth") }}</span>
        <select v-model="imageWidthPreset" class="image-select" @change="applyImageWidthPreset">
          <option value="25%">25%</option>
          <option value="40%">40%</option>
          <option value="60%">60%</option>
          <option value="80%">80%</option>
          <option value="100%">100%</option>
          <option value="custom">{{ t("custom") }}</option>
        </select>
        <input
          v-model="imageCustomWidth"
          class="image-input"
          type="text"
          placeholder="80% / 360px"
          @keydown.enter.prevent="applyImageWidth"
        />
        <button type="button" class="link-btn primary" @click="applyImageWidth">{{ t("apply") }}</button>
      </div>

      <div class="image-editor-row">
        <span class="image-editor-label">{{ t("imageFloat") }}</span>
        <button
          type="button"
          class="image-float-btn"
          :class="{ active: imageFloat === 'none' }"
          @click="setImageFloat('none')"
        >
          {{ t("imageFloatNone") }}
        </button>
        <button
          type="button"
          class="image-float-btn"
          :class="{ active: imageFloat === 'left' }"
          @click="setImageFloat('left')"
        >
          {{ t("imageFloatLeft") }}
        </button>
        <button
          type="button"
          class="image-float-btn"
          :class="{ active: imageFloat === 'right' }"
          @click="setImageFloat('right')"
        >
          {{ t("imageFloatRight") }}
        </button>
        <button
          type="button"
          class="image-float-btn"
          :class="{ active: imageFloat === 'center' }"
          @click="setImageFloat('center')"
        >
          {{ t("imageFloatCenter") }}
        </button>
        <button type="button" class="link-btn" @click="removeCurrentImage">{{ t("removeImage") }}</button>
      </div>
    </div>

    <editor-content class="editor-body" :style="{ minHeight: normalizedMinHeight }" :editor="editor" />

    <input
      ref="fileInputRef"
      class="hidden-file-input"
      type="file"
      accept="image/*"
      @change="onFileChange"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { mergeAttributes } from "@tiptap/core";
import DOMPurify from "dompurify";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

const IMAGE_WIDTH_PRESETS = ["25%", "40%", "60%", "80%", "100%"];
const IMAGE_FLOAT_VALUES = new Set(["none", "left", "right", "center"]);

const IMAGE_FLOAT_STYLES = {
  none: "float: none; display: block; margin: 10px 0;",
  left: "float: left; display: block; margin: 8px 16px 12px 0;",
  right: "float: right; display: block; margin: 8px 0 12px 16px;",
  center: "float: none; display: block; margin: 10px auto;",
};

function normalizeImageFloat(value) {
  return IMAGE_FLOAT_VALUES.has(value) ? value : "none";
}

function normalizeImageWidthValue(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "100%";
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return "100%";
  }

  if (/^\d+(\.\d+)?%$/.test(normalized)) {
    return normalized;
  }

  if (/^\d+(\.\d+)?px$/.test(normalized)) {
    return normalized;
  }

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return `${normalized}px`;
  }

  return "100%";
}

const RichImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) =>
          normalizeImageWidthValue(
            element.getAttribute("data-width") || element.style.width || element.getAttribute("width") || "100%"
          ),
        renderHTML: (attributes) => {
          const width = normalizeImageWidthValue(attributes.width);
          return {
            "data-width": width,
            style: `width: ${width}; max-width: 100%;`,
          };
        },
      },
      float: {
        default: "none",
        parseHTML: (element) => normalizeImageFloat(element.getAttribute("data-float") || "none"),
        renderHTML: (attributes) => {
          const float = normalizeImageFloat(attributes.float);
          return {
            "data-float": float,
            style: IMAGE_FLOAT_STYLES[float],
          };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
});

const DEFAULT_TOOLBAR = [
  ["blockType"],
  ["bold", "italic", "underline", "strike", "highlight"],
  ["bulletList", "orderedList", "horizontalRule"],
  ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
  ["link", "image"],
  ["clearFormatting", "undo", "redo"],
];

const AVAILABLE_ITEMS = new Set([
  "blockType",
  "bold",
  "italic",
  "underline",
  "strike",
  "highlight",
  "bulletList",
  "orderedList",
  "horizontalRule",
  "alignLeft",
  "alignCenter",
  "alignRight",
  "alignJustify",
  "link",
  "image",
  "clearFormatting",
  "undo",
  "redo",
]);

const LOCALES = {
  "zh-CN": {
    blockType: "段落样式",
    paragraph: "正文",
    heading1: "标题 1",
    heading2: "标题 2",
    heading3: "标题 3",
    blockquote: "引用",
    codeBlock: "代码块",
    bold: "加粗",
    italic: "斜体",
    underline: "下划线",
    strike: "删除线",
    highlight: "高亮",
    bulletList: "无序",
    orderedList: "有序",
    horizontalRule: "分割线",
    alignLeft: "左",
    alignCenter: "中",
    alignRight: "右",
    alignJustify: "两端",
    link: "链接",
    image: "图片",
    clearFormatting: "清除样式",
    undo: "撤销",
    redo: "重做",
    linkPlaceholder: "请输入链接地址",
    imageWidth: "图片尺寸",
    imageFloat: "图片位置",
    imageFloatNone: "默认",
    imageFloatLeft: "左浮动",
    imageFloatRight: "右浮动",
    imageFloatCenter: "居中",
    removeImage: "删除图片",
    custom: "自定义",
    apply: "应用",
    remove: "移除",
    cancel: "取消",
  },
  "en-US": {
    blockType: "Block type",
    paragraph: "Paragraph",
    heading1: "Heading 1",
    heading2: "Heading 2",
    heading3: "Heading 3",
    blockquote: "Quote",
    codeBlock: "Code block",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strike: "Strike",
    highlight: "Highlight",
    bulletList: "Bulleted",
    orderedList: "Ordered",
    horizontalRule: "Divider",
    alignLeft: "Left",
    alignCenter: "Center",
    alignRight: "Right",
    alignJustify: "Justify",
    link: "Link",
    image: "Image",
    clearFormatting: "Clear",
    undo: "Undo",
    redo: "Redo",
    linkPlaceholder: "Paste link URL",
    imageWidth: "Image size",
    imageFloat: "Image position",
    imageFloatNone: "Normal",
    imageFloatLeft: "Float left",
    imageFloatRight: "Float right",
    imageFloatCenter: "Center",
    removeImage: "Delete image",
    custom: "Custom",
    apply: "Apply",
    remove: "Remove",
    cancel: "Cancel",
  },
};

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "开始输入内容...",
  },
  editable: {
    type: Boolean,
    default: true,
  },
  minHeight: {
    type: [Number, String],
    default: 280,
  },
  locale: {
    type: String,
    default: "zh-CN",
  },
  messages: {
    type: Object,
    default: () => ({}),
  },
  toolbar: {
    type: Array,
    default: () => [
      ["blockType"],
      ["bold", "italic", "underline", "strike", "highlight"],
      ["bulletList", "orderedList", "horizontalRule"],
      ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
      ["link", "image"],
      ["clearFormatting", "undo", "redo"],
    ],
  },
  uploadImage: {
    type: Function,
    default: null,
  },
  sanitize: {
    type: Boolean,
    default: true,
  },
  sanitizeOptions: {
    type: Object,
    default: () => ({
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["style", "script", "iframe"],
      FORBID_ATTR: ["onerror", "onload", "onclick"],
    }),
  },
  linkTarget: {
    type: String,
    default: "_blank",
  },
  linkRel: {
    type: String,
    default: "noopener noreferrer nofollow",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "focus",
  "blur",
  "ready",
  "image-upload-error",
]);

const fileInputRef = ref(null);
const showLinkEditor = ref(false);
const linkUrl = ref("");
const showImageEditor = ref(false);
const imageWidthPreset = ref("100%");
const imageCustomWidth = ref("100%");
const imageFloat = ref("none");

const messages = computed(() => {
  const preset = LOCALES[props.locale] || LOCALES["zh-CN"];
  return {
    ...preset,
    ...props.messages,
  };
});

function t(key) {
  return messages.value[key] || key;
}

const normalizedToolbar = computed(() => {
  const value = Array.isArray(props.toolbar) ? props.toolbar : DEFAULT_TOOLBAR;
  const groups = Array.isArray(value[0]) ? value : [value];

  return groups
    .map((group) =>
      group.filter((item) => {
        if (typeof item !== "string") {
          return false;
        }

        return AVAILABLE_ITEMS.has(item);
      })
    )
    .filter((group) => group.length > 0);
});

const normalizedMinHeight = computed(() => {
  if (typeof props.minHeight === "number") {
    return `${props.minHeight}px`;
  }

  return props.minHeight;
});

function sanitizeHTML(html) {
  const fallback = "<p></p>";
  const raw = typeof html === "string" ? html : fallback;

  if (!props.sanitize || typeof window === "undefined") {
    return raw || fallback;
  }

  const result = DOMPurify.sanitize(raw, props.sanitizeOptions);
  return (typeof result === "string" && result.trim()) || fallback;
}

function createInitialContent() {
  return sanitizeHTML(props.modelValue || "<p></p>");
}

const editor = useEditor({
  content: createInitialContent(),
  editable: props.editable,
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Underline,
    Highlight,
    RichImage.configure({
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        rel: props.linkRel,
        target: props.linkTarget,
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      emptyEditorClass: "is-editor-empty",
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
      defaultAlignment: "left",
    }),
  ],
  editorProps: {
    transformPastedHTML: (html) => sanitizeHTML(html),
  },
  onUpdate: ({ editor: tiptapEditor }) => {
    emit("update:modelValue", sanitizeHTML(tiptapEditor.getHTML()));
  },
  onFocus: ({ event }) => {
    emit("focus", event);
  },
  onBlur: ({ event }) => {
    emit("blur", event);
  },
  onSelectionUpdate: ({ editor: tiptapEditor }) => {
    syncImageEditorState(tiptapEditor);
  },
  onCreate: ({ editor: tiptapEditor }) => {
    syncImageEditorState(tiptapEditor);
  },
});

watch(
  () => editor.value,
  (value) => {
    if (!value) {
      return;
    }

    emit("ready", value);
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (value) => {
    const tiptapEditor = editor.value;
    if (!tiptapEditor) {
      return;
    }

    const nextValue = sanitizeHTML(value || "<p></p>");
    if (nextValue === tiptapEditor.getHTML()) {
      return;
    }

    tiptapEditor.commands.setContent(nextValue, false);
  }
);

watch(
  () => props.editable,
  (value) => {
    editor.value?.setEditable(value);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const blockType = computed(() => {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return "paragraph";
  }

  if (tiptapEditor.isActive("codeBlock")) {
    return "codeBlock";
  }

  if (tiptapEditor.isActive("blockquote")) {
    return "blockquote";
  }

  if (tiptapEditor.isActive("heading", { level: 1 })) {
    return "heading-1";
  }

  if (tiptapEditor.isActive("heading", { level: 2 })) {
    return "heading-2";
  }

  if (tiptapEditor.isActive("heading", { level: 3 })) {
    return "heading-3";
  }

  return "paragraph";
});

const canUndo = computed(() => editor.value?.can().chain().focus().undo().run() ?? false);
const canRedo = computed(() => editor.value?.can().chain().focus().redo().run() ?? false);

const alignMap = {
  alignLeft: "left",
  alignCenter: "center",
  alignRight: "right",
  alignJustify: "justify",
};

const iconMap = {
  bold: "B",
  italic: "I",
  underline: "U",
  strike: "S",
  highlight: "✦",
  bulletList: "••",
  orderedList: "1.",
  horizontalRule: "─",
  alignLeft: "≡←",
  alignCenter: "≡↔",
  alignRight: "≡→",
  alignJustify: "☰",
  link: "🔗",
  image: "🖼",
  clearFormatting: "⌫",
  undo: "↶",
  redo: "↷",
};

const commandMap = {
  bold: (tiptapEditor) => tiptapEditor.chain().focus().toggleBold().run(),
  italic: (tiptapEditor) => tiptapEditor.chain().focus().toggleItalic().run(),
  underline: (tiptapEditor) => tiptapEditor.chain().focus().toggleUnderline().run(),
  strike: (tiptapEditor) => tiptapEditor.chain().focus().toggleStrike().run(),
  highlight: (tiptapEditor) => tiptapEditor.chain().focus().toggleHighlight().run(),
  bulletList: (tiptapEditor) => tiptapEditor.chain().focus().toggleBulletList().run(),
  orderedList: (tiptapEditor) => tiptapEditor.chain().focus().toggleOrderedList().run(),
  horizontalRule: (tiptapEditor) => tiptapEditor.chain().focus().setHorizontalRule().run(),
  clearFormatting: (tiptapEditor) =>
    tiptapEditor.chain().focus().unsetAllMarks().clearNodes().run(),
  undo: (tiptapEditor) => tiptapEditor.chain().focus().undo().run(),
  redo: (tiptapEditor) => tiptapEditor.chain().focus().redo().run(),
};

function changeBlockType(event) {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  const value = event.target.value;
  const chain = tiptapEditor.chain().focus();

  if (value === "paragraph") {
    chain.setParagraph().run();
    return;
  }

  if (value === "blockquote") {
    chain.toggleBlockquote().run();
    return;
  }

  if (value === "codeBlock") {
    chain.toggleCodeBlock().run();
    return;
  }

  if (value.startsWith("heading-")) {
    const level = Number(value.split("-")[1]);
    chain.toggleHeading({ level }).run();
  }
}

function handleToolbarAction(item) {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  if (item in alignMap) {
    tiptapEditor.chain().focus().setTextAlign(alignMap[item]).run();
    return;
  }

  if (item === "link") {
    openLinkEditor();
    return;
  }

  if (item === "image") {
    fileInputRef.value?.click();
    return;
  }

  commandMap[item]?.(tiptapEditor);
}

function iconOf(item) {
  return iconMap[item] || t(item);
}

function syncImageEditorState(tiptapEditor) {
  if (!tiptapEditor || !tiptapEditor.isActive("image")) {
    showImageEditor.value = false;
    return;
  }

  const attrs = tiptapEditor.getAttributes("image") || {};
  const width = normalizeImageWidthValue(attrs.width || "100%");
  const float = normalizeImageFloat(attrs.float || "none");

  showImageEditor.value = true;
  imageCustomWidth.value = width;
  imageWidthPreset.value = IMAGE_WIDTH_PRESETS.includes(width) ? width : "custom";
  imageFloat.value = float;
}

function applyImageAttrs(attrs) {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  tiptapEditor.chain().focus().updateAttributes("image", attrs).run();
  syncImageEditorState(tiptapEditor);
}

function applyImageWidthPreset() {
  if (imageWidthPreset.value === "custom") {
    return;
  }

  imageCustomWidth.value = imageWidthPreset.value;
  applyImageAttrs({ width: imageWidthPreset.value });
}

function applyImageWidth() {
  const width = normalizeImageWidthValue(imageCustomWidth.value);
  imageCustomWidth.value = width;
  imageWidthPreset.value = IMAGE_WIDTH_PRESETS.includes(width) ? width : "custom";
  applyImageAttrs({ width });
}

function setImageFloat(float) {
  const normalized = normalizeImageFloat(float);
  imageFloat.value = normalized;
  applyImageAttrs({ float: normalized });
}

function removeCurrentImage() {
  const tiptapEditor = editor.value;
  if (!tiptapEditor || !tiptapEditor.isActive("image")) {
    return;
  }

  tiptapEditor.chain().focus().deleteSelection().run();
  syncImageEditorState(tiptapEditor);
}

function isButtonActive(item) {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return false;
  }

  if (item in alignMap) {
    return tiptapEditor.isActive({ textAlign: alignMap[item] });
  }

  if (item === "link") {
    return tiptapEditor.isActive("link");
  }

  const activeMap = {
    bulletList: "bulletList",
    orderedList: "orderedList",
    bold: "bold",
    italic: "italic",
    underline: "underline",
    strike: "strike",
    highlight: "highlight",
  };

  const mark = activeMap[item];
  if (mark) {
    return tiptapEditor.isActive(mark);
  }

  return false;
}

function isButtonDisabled(item) {
  if (!props.editable) {
    return true;
  }

  if (item === "undo") {
    return !canUndo.value;
  }

  if (item === "redo") {
    return !canRedo.value;
  }

  return false;
}

function openLinkEditor() {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  linkUrl.value = tiptapEditor.getAttributes("link").href || "";
  showLinkEditor.value = true;
}

function normalizeUrl(rawUrl) {
  const url = rawUrl.trim();
  if (!url) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function applyLink() {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  const href = normalizeUrl(linkUrl.value);
  if (!href) {
    tiptapEditor.chain().focus().unsetLink().run();
    closeLinkEditor();
    return;
  }

  tiptapEditor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  closeLinkEditor();
}

function removeLink() {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  tiptapEditor.chain().focus().unsetLink().run();
  closeLinkEditor();
}

function closeLinkEditor() {
  showLinkEditor.value = false;
  linkUrl.value = "";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function onFileChange(event) {
  const file = event?.target?.files?.[0];
  event.target.value = "";

  if (!file || !props.editable) {
    return;
  }

  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  try {
    const src = props.uploadImage
      ? await props.uploadImage(file)
      : await fileToDataUrl(file);

    if (typeof src !== "string" || !src.trim()) {
      throw new Error("uploadImage must return a non-empty string URL");
    }

    tiptapEditor.chain().focus().setImage({ src: src.trim(), width: "100%", float: "none" }).run();
    syncImageEditorState(tiptapEditor);
  } catch (error) {
    emit("image-upload-error", error);
  }
}

defineExpose({
  editor,
  getHTML: () => sanitizeHTML(editor.value?.getHTML() ?? ""),
  getJSON: () => editor.value?.getJSON() ?? null,
  setHTML: (content) => editor.value?.commands.setContent(sanitizeHTML(content || "<p></p>"), false),
  clear: () => editor.value?.commands.clearContent(true),
  focus: () => editor.value?.chain().focus().run(),
});
</script>

<style scoped>
.vue-editor {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.vue-editor.is-disabled {
  opacity: 0.78;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  background: #f8fafc;
}

.toolbar-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-right: 8px;
  border-right: 1px solid #e5e7eb;
}

.toolbar-group:last-child {
  border-right: none;
  padding-right: 0;
}

.toolbar-select,
.toolbar-btn,
.link-btn {
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 6px;
  color: #1f2937;
  font-size: 13px;
  line-height: 1;
  padding: 8px 10px;
  cursor: pointer;
}

.toolbar-btn {
  min-width: 36px;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 8px;
}

.btn-icon {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.toolbar-btn[data-tooltip] {
  position: relative;
}

.toolbar-btn[data-tooltip]:hover::after {
  position: absolute;
  content: attr(data-tooltip);
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  line-height: 1;
  padding: 7px 8px;
  color: #ffffff;
  background: rgba(17, 24, 39, 0.92);
  border-radius: 5px;
  pointer-events: none;
  z-index: 20;
}

.toolbar-btn[data-tooltip]:hover::before {
  position: absolute;
  content: "";
  left: 50%;
  bottom: calc(100% + 2px);
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(17, 24, 39, 0.92);
  pointer-events: none;
  z-index: 20;
}

.toolbar-btn:hover,
.toolbar-select:hover,
.link-btn:hover {
  border-color: #9ca3af;
}

.toolbar-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.toolbar-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.link-editor {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  background: #f9fafb;
}

.link-input {
  flex: 1;
  min-width: 160px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}

.link-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.link-btn.primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.image-editor {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  background: #f8fafc;
}

.image-editor-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.image-editor-label {
  font-size: 12px;
  color: #4b5563;
  min-width: 62px;
}

.image-select,
.image-input,
.image-float-btn {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2937;
  font-size: 12px;
  padding: 7px 9px;
}

.image-input {
  min-width: 110px;
}

.image-float-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.editor-body {
  padding: 14px;
}

.hidden-file-input {
  display: none;
}

:deep(.ProseMirror) {
  min-height: inherit;
  outline: none;
  color: #111827;
  line-height: 1.75;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.ProseMirror p),
:deep(.ProseMirror h1),
:deep(.ProseMirror h2),
:deep(.ProseMirror h3),
:deep(.ProseMirror blockquote),
:deep(.ProseMirror ul),
:deep(.ProseMirror ol),
:deep(.ProseMirror pre) {
  margin: 0 0 12px;
}

:deep(.ProseMirror h1) {
  font-size: 28px;
}

:deep(.ProseMirror h2) {
  font-size: 24px;
}

:deep(.ProseMirror h3) {
  font-size: 20px;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid #f87171;
  margin-left: 0;
  padding: 8px 12px;
  color: #374151;
  background: #fff7ed;
}

:deep(.ProseMirror pre) {
  background: #111827;
  color: #f9fafb;
  border-radius: 6px;
  padding: 10px 12px;
  overflow-x: auto;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 22px;
}

:deep(.ProseMirror a) {
  color: #2563eb;
  text-decoration: underline;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  border-radius: 6px;
  display: block;
  margin: 10px 0;
}

:deep(.ProseMirror img[data-float="left"]) {
  float: left;
  margin: 8px 16px 12px 0;
}

:deep(.ProseMirror img[data-float="right"]) {
  float: right;
  margin: 8px 0 12px 16px;
}

:deep(.ProseMirror img[data-float="center"]) {
  float: none;
  margin: 10px auto;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
