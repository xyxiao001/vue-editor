<template>
  <div
    class="vue-editor"
    :class="{ 'is-disabled': !editable, 'has-upload-feedback': showUploadFeedback }"
    :style="themeStyleVars"
  >
    <div v-if="normalizedToolbar.length" class="editor-toolbar" role="toolbar" aria-label="Editor Toolbar">
      <div v-for="(group, groupIndex) in normalizedToolbar" :key="`group-${groupIndex}`" class="toolbar-group">
        <template v-for="item in group" :key="item.key">
          <label v-if="item.key === 'blockType'" class="sr-only" for="editor-block-type">{{ t("blockType") }}</label>
          <select
            v-if="item.key === 'blockType'"
            id="editor-block-type"
            class="toolbar-select"
            :value="blockType"
            :disabled="!editable || item.mode === 'disabled'"
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
            :class="{ active: isButtonActive(item.key) }"
            :title="t(item.key)"
            :data-tooltip="t(item.key)"
            :disabled="isButtonDisabled(item.key, item.mode)"
            @click="handleToolbarAction(item.key)"
          >
            <span class="btn-icon" aria-hidden="true">{{ iconOf(item.key) }}</span>
            <span class="sr-only">{{ t(item.key) }}</span>
          </button>
        </template>
      </div>
    </div>

    <div v-if="showLinkEditor" class="link-editor">
      <div class="link-editor-row">
        <input
          v-model="linkUrl"
          class="link-input"
          type="url"
          :placeholder="t('linkPlaceholder')"
          @input="clearLinkValidationError"
          @keydown.enter.prevent="applyLink"
          @keydown.esc.prevent="closeLinkEditor"
        />
        <button type="button" class="link-btn primary" @click="applyLink">{{ t("apply") }}</button>
        <button type="button" class="link-btn" @click="removeLink">{{ t("remove") }}</button>
        <button type="button" class="link-btn" @click="closeLinkEditor">{{ t("cancel") }}</button>
      </div>
      <p v-if="linkValidationMessage" class="link-feedback is-error">{{ linkValidationMessage }}</p>
      <p v-else-if="hasLinkRestrictions" class="link-feedback">
        {{ linkRestrictionHint }}
      </p>
    </div>

    <div v-if="showUploadFeedback" class="upload-feedback" :class="`is-${uploadState}`">
      <div class="upload-feedback-head">
        <strong class="upload-feedback-title">{{ uploadStatusLabel }}</strong>
        <span v-if="uploadState === 'uploading'" class="upload-feedback-progress">{{ uploadProgressDisplay }}</span>
      </div>
      <div v-if="uploadState === 'uploading'" class="upload-progress" aria-hidden="true">
        <span :style="{ width: `${uploadProgress}%` }"></span>
      </div>
      <p class="upload-feedback-message">
        {{ uploadMessage }}
      </p>
      <div class="upload-feedback-actions">
        <button v-if="canRetryUpload" type="button" class="link-btn" @click="retryLastImageUpload">
          {{ t("retry") }}
        </button>
        <button v-if="uploadState !== 'uploading'" type="button" class="link-btn" @click="dismissUploadFeedback">
          {{ t("dismiss") }}
        </button>
      </div>
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

    <div v-if="showCodeEditor" class="code-editor">
      <div class="table-editor-row">
        <span class="image-editor-label">{{ t("codeLanguage") }}</span>
        <select v-model="codeLanguage" class="image-select" @change="applyCodeLanguage">
          <option v-for="item in codeLanguageOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>
    </div>

    <div
      ref="editorStageRef"
      class="editor-stage"
      :style="{ minHeight: normalizedMinHeight }"
      @mousemove="handleEditorPointerMove"
      @mouseleave="handleEditorPointerLeave"
    >
      <div v-if="showTableHandles" class="table-column-highlight" :style="tableColumnHighlightStyle"></div>
      <div v-if="showTableHandles" class="table-row-highlight" :style="tableRowHighlightStyle"></div>
      <div
        v-if="showTableHandles"
        class="table-corner-handle"
        :style="tableCornerHandleStyle"
        @mousedown.prevent
        @mouseenter="handleTableControlsEnter"
        @mouseleave="handleTableControlsLeave"
      >
        <button
          type="button"
          class="table-handle-btn"
          :title="t('toggleTableHeader')"
          @mousedown.prevent
          @click="toggleTableHeader"
        >
          H
        </button>
        <button
          type="button"
          class="table-handle-btn danger"
          :title="t('deleteTable')"
          @mousedown.prevent
          @click="deleteTable"
        >
          ×
        </button>
      </div>
      <div
        v-if="showTableHandles"
        class="table-column-handle"
        :style="tableColumnHandleStyle"
        @mousedown.prevent
        @mouseenter="handleTableControlsEnter"
        @mouseleave="handleTableControlsLeave"
      >
        <button
          type="button"
          class="table-handle-btn"
          :title="t('addTableColumn')"
          @mousedown.prevent
          @click="addTableColumn"
        >
          +
        </button>
        <button
          type="button"
          class="table-handle-btn"
          :title="t('removeTableColumn')"
          @mousedown.prevent
          @click="removeTableColumn"
        >
          -
        </button>
      </div>
      <div
        v-if="showTableHandles"
        class="table-row-handle"
        :style="tableRowHandleStyle"
        @mousedown.prevent
        @mouseenter="handleTableControlsEnter"
        @mouseleave="handleTableControlsLeave"
      >
        <button
          type="button"
          class="table-handle-btn"
          :title="t('addTableRow')"
          @mousedown.prevent
          @click="addTableRow"
        >
          +
        </button>
        <button
          type="button"
          class="table-handle-btn"
          :title="t('removeTableRow')"
          @mousedown.prevent
          @click="removeTableRow"
        >
          -
        </button>
      </div>
      <editor-content class="editor-body" :editor="editor" />
    </div>

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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import DOMPurify from "dompurify";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { common, createLowlight } from "lowlight";

const IMAGE_WIDTH_PRESETS = ["25%", "40%", "60%", "80%", "100%"];
const IMAGE_FLOAT_VALUES = new Set(["none", "left", "right", "center"]);
const CODE_LANGUAGE_OPTIONS = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "markdown", label: "Markdown" },
];
const DEFAULT_ALLOWED_LINK_PROTOCOLS = ["http", "https", "mailto", "tel"];
const DEFAULT_PASTE_WHITELIST_TAGS = [
  "a",
  "blockquote",
  "br",
  "col",
  "colgroup",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "hr",
  "img",
  "input",
  "label",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];
const DEFAULT_PASTE_WHITELIST_ATTRS = [
  "alt",
  "checked",
  "class",
  "colspan",
  "data-float",
  "data-checked",
  "data-type",
  "data-width",
  "href",
  "rel",
  "rowspan",
  "src",
  "target",
  "title",
  "type",
];
const lowlight = createLowlight(common);

const IMAGE_FLOAT_STYLES = {
  none: "float: none; display: block; margin: 10px 0;",
  left: "float: left; display: block; margin: 8px 16px 12px 0;",
  right: "float: right; display: block; margin: 8px 0 12px 16px;",
  center: "float: none; display: block; margin: 10px auto;",
};

const TOOLBAR_THEME_PRESETS = {
  light: {
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
    buttonDisabledOpacity: "0.45",
    primaryBackground: "#2563eb",
    primaryText: "#ffffff",
    editorBackground: "#ffffff",
    editorText: "#111827",
    mutedText: "#4b5563",
    linkColor: "#2563eb",
    blockquoteBorder: "#f87171",
    blockquoteBackground: "#fff7ed",
    codeBackground: "#111827",
    codeText: "#f9fafb",
    tooltipBackground: "rgba(17, 24, 39, 0.92)",
    progressBackground: "#dbeafe",
    progressBar: "#2563eb",
    feedbackSuccess: "#065f46",
    feedbackSuccessBackground: "#ecfdf5",
    feedbackError: "#991b1b",
    feedbackErrorBackground: "#fef2f2",
  },
  slate: {
    borderColor: "#1f2937",
    toolbarBackground: "#0f172a",
    toolbarBorder: "#1e293b",
    groupBorder: "#334155",
    panelBackground: "#111827",
    buttonBackground: "#0b1220",
    buttonBorder: "#334155",
    buttonText: "#e5edf7",
    buttonHoverBorder: "#64748b",
    buttonActiveBackground: "#13233e",
    buttonActiveBorder: "#38bdf8",
    buttonActiveText: "#7dd3fc",
    buttonDisabledOpacity: "0.4",
    primaryBackground: "#38bdf8",
    primaryText: "#082f49",
    editorBackground: "#ffffff",
    editorText: "#111827",
    mutedText: "#94a3b8",
    linkColor: "#0284c7",
    blockquoteBorder: "#f59e0b",
    blockquoteBackground: "#fff7ed",
    codeBackground: "#020617",
    codeText: "#e2e8f0",
    tooltipBackground: "rgba(2, 6, 23, 0.95)",
    progressBackground: "#1e3a8a",
    progressBar: "#38bdf8",
    feedbackSuccess: "#a7f3d0",
    feedbackSuccessBackground: "#064e3b",
    feedbackError: "#fecaca",
    feedbackErrorBackground: "#7f1d1d",
  },
  sand: {
    borderColor: "#d6c7b6",
    toolbarBackground: "#fbf4ea",
    toolbarBorder: "#eadfce",
    groupBorder: "#dccdbb",
    panelBackground: "#f7efe3",
    buttonBackground: "#fffdf9",
    buttonBorder: "#d6c7b6",
    buttonText: "#5b4634",
    buttonHoverBorder: "#b08968",
    buttonActiveBackground: "#f1dfc2",
    buttonActiveBorder: "#b45309",
    buttonActiveText: "#92400e",
    buttonDisabledOpacity: "0.5",
    primaryBackground: "#b45309",
    primaryText: "#fff7ed",
    editorBackground: "#fffdf8",
    editorText: "#2f241a",
    mutedText: "#7c6753",
    linkColor: "#b45309",
    blockquoteBorder: "#c2410c",
    blockquoteBackground: "#fff7ed",
    codeBackground: "#292524",
    codeText: "#f5f5f4",
    tooltipBackground: "rgba(68, 47, 30, 0.94)",
    progressBackground: "#fed7aa",
    progressBar: "#c2410c",
    feedbackSuccess: "#14532d",
    feedbackSuccessBackground: "#f0fdf4",
    feedbackError: "#9a3412",
    feedbackErrorBackground: "#fff7ed",
  },
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

function normalizeTheme(inputTheme) {
  const base = TOOLBAR_THEME_PRESETS.light;
  if (typeof inputTheme === "string") {
    return TOOLBAR_THEME_PRESETS[inputTheme] || base;
  }

  if (inputTheme && typeof inputTheme === "object") {
    return {
      ...base,
      ...inputTheme,
    };
  }

  return base;
}

function uniqueStringList(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((item) => String(item).trim()).filter(Boolean))];
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
  ["bulletList", "orderedList", "taskList", "horizontalRule"],
  ["table"],
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
  "taskList",
  "horizontalRule",
  "table",
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
    taskList: "任务列表",
    table: "表格",
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
    tableTools: "表格操作",
    insertTable: "插入表格",
    addTableRow: "增加行",
    removeTableRow: "删除行",
    addTableColumn: "增加列",
    removeTableColumn: "删除列",
    toggleTableHeader: "切换表头",
    deleteTable: "删除表格",
    codeLanguage: "代码语言",
    custom: "自定义",
    apply: "应用",
    remove: "移除",
    cancel: "取消",
    retry: "重试",
    dismiss: "关闭",
    uploadPending: "等待上传",
    uploadUploading: "图片上传中",
    uploadSuccess: "图片上传完成",
    uploadError: "图片上传失败",
    uploadSuccessMessage: "图片已经插入编辑器，可以继续调整尺寸和位置。",
    uploadPendingMessage: "请选择一张图片开始上传。",
    linkInvalidFormat: "链接格式不正确，请输入完整地址或域名。",
    linkInvalidProtocol: "当前协议不在允许范围内。",
    linkInvalidDomain: "当前域名不在白名单内。",
    linkInvalidCustom: "链接未通过校验规则。",
    linkRestrictionProtocols: "允许协议",
    linkRestrictionDomains: "允许域名",
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
    taskList: "Task list",
    table: "Table",
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
    tableTools: "Table tools",
    insertTable: "Insert table",
    addTableRow: "Add row",
    removeTableRow: "Delete row",
    addTableColumn: "Add column",
    removeTableColumn: "Delete column",
    toggleTableHeader: "Toggle header",
    deleteTable: "Delete table",
    codeLanguage: "Code language",
    custom: "Custom",
    apply: "Apply",
    remove: "Remove",
    cancel: "Cancel",
    retry: "Retry",
    dismiss: "Dismiss",
    uploadPending: "Waiting for upload",
    uploadUploading: "Uploading image",
    uploadSuccess: "Image uploaded",
    uploadError: "Image upload failed",
    uploadSuccessMessage: "The image is now inserted into the editor and ready for layout tweaks.",
    uploadPendingMessage: "Choose an image to start uploading.",
    linkInvalidFormat: "The link format is invalid. Enter a full URL or hostname.",
    linkInvalidProtocol: "The link protocol is not allowed.",
    linkInvalidDomain: "The link domain is not in the whitelist.",
    linkInvalidCustom: "The link did not pass custom validation.",
    linkRestrictionProtocols: "Allowed protocols",
    linkRestrictionDomains: "Allowed domains",
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
      ["bulletList", "orderedList", "taskList", "horizontalRule"],
      ["table"],
      ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
      ["link", "image"],
      ["clearFormatting", "undo", "redo"],
    ],
  },
  toolbarPermissions: {
    type: Object,
    default: () => ({}),
  },
  toolbarTheme: {
    type: [String, Object],
    default: "light",
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
  pasteWhitelistTags: {
    type: Array,
    default: () => [
      "a",
      "blockquote",
      "br",
      "col",
      "colgroup",
      "code",
      "em",
      "h1",
      "h2",
      "h3",
      "hr",
      "img",
      "input",
      "label",
      "li",
      "ol",
      "p",
      "pre",
      "s",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "u",
      "ul",
    ],
  },
  pasteWhitelistAttrs: {
    type: Array,
    default: () => [
      "alt",
      "checked",
      "class",
      "colspan",
      "data-float",
      "data-checked",
      "data-type",
      "data-width",
      "href",
      "rel",
      "rowspan",
      "src",
      "target",
      "title",
      "type",
    ],
  },
  pasteSanitizeOptions: {
    type: Object,
    default: () => ({}),
  },
  linkTarget: {
    type: String,
    default: "_blank",
  },
  linkRel: {
    type: String,
    default: "noopener noreferrer nofollow",
  },
  allowedLinkProtocols: {
    type: Array,
    default: () => ["http", "https", "mailto", "tel"],
  },
  linkDomainWhitelist: {
    type: Array,
    default: () => [],
  },
  validateLink: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "focus",
  "blur",
  "ready",
  "image-upload-start",
  "image-upload-progress",
  "image-upload-success",
  "image-upload-error",
]);

const fileInputRef = ref(null);
const editorStageRef = ref(null);
const showLinkEditor = ref(false);
const linkUrl = ref("");
const linkValidationMessage = ref("");
const showImageEditor = ref(false);
const showCodeEditor = ref(false);
const imageWidthPreset = ref("100%");
const imageCustomWidth = ref("100%");
const imageFloat = ref("none");
const currentImagePos = ref(null);
const codeLanguage = ref("plaintext");
const hoveredTableElement = ref(null);
const hoveredTableCellElement = ref(null);
const isPointerOverTable = ref(false);
const isPointerOverTableControls = ref(false);
const showTableHandles = ref(false);
const tableColumnHandleTop = ref(0);
const tableColumnHandleLeft = ref(0);
const tableRowHandleTop = ref(0);
const tableRowHandleLeft = ref(0);
const tableColumnHighlightTop = ref(0);
const tableColumnHighlightLeft = ref(0);
const tableColumnHighlightWidth = ref(0);
const tableColumnHighlightHeight = ref(0);
const tableRowHighlightTop = ref(0);
const tableRowHighlightLeft = ref(0);
const tableRowHighlightWidth = ref(0);
const tableRowHighlightHeight = ref(0);
const tableCornerHandleTop = ref(0);
const tableCornerHandleLeft = ref(0);
const tableHideTimer = ref(null);
const uploadState = ref("idle");
const uploadProgress = ref(0);
const uploadMessage = ref("");
const lastUploadFile = ref(null);

const messages = computed(() => {
  const preset = LOCALES[props.locale] || LOCALES["zh-CN"];
  return {
    ...preset,
    ...props.messages,
  };
});

const normalizedAllowedLinkProtocols = computed(() => {
  const values = uniqueStringList(props.allowedLinkProtocols).map((item) => item.toLowerCase());
  return values.length ? values : DEFAULT_ALLOWED_LINK_PROTOCOLS;
});

const normalizedLinkDomainWhitelist = computed(() => {
  return uniqueStringList(props.linkDomainWhitelist).map((item) => item.toLowerCase());
});

const normalizedToolbarTheme = computed(() => normalizeTheme(props.toolbarTheme));

const themeStyleVars = computed(() => {
  const theme = normalizedToolbarTheme.value;
  return {
    "--ve-border-color": theme.borderColor,
    "--ve-toolbar-bg": theme.toolbarBackground,
    "--ve-toolbar-border": theme.toolbarBorder,
    "--ve-group-border": theme.groupBorder,
    "--ve-panel-bg": theme.panelBackground,
    "--ve-btn-bg": theme.buttonBackground,
    "--ve-btn-border": theme.buttonBorder,
    "--ve-btn-text": theme.buttonText,
    "--ve-btn-hover-border": theme.buttonHoverBorder,
    "--ve-btn-active-bg": theme.buttonActiveBackground,
    "--ve-btn-active-border": theme.buttonActiveBorder,
    "--ve-btn-active-text": theme.buttonActiveText,
    "--ve-btn-disabled-opacity": theme.buttonDisabledOpacity,
    "--ve-primary-bg": theme.primaryBackground,
    "--ve-primary-text": theme.primaryText,
    "--ve-editor-bg": theme.editorBackground,
    "--ve-editor-text": theme.editorText,
    "--ve-muted-text": theme.mutedText,
    "--ve-link-color": theme.linkColor,
    "--ve-blockquote-border": theme.blockquoteBorder,
    "--ve-blockquote-bg": theme.blockquoteBackground,
    "--ve-code-bg": theme.codeBackground,
    "--ve-code-text": theme.codeText,
    "--ve-tooltip-bg": theme.tooltipBackground,
    "--ve-progress-bg": theme.progressBackground,
    "--ve-progress-bar": theme.progressBar,
    "--ve-feedback-success": theme.feedbackSuccess,
    "--ve-feedback-success-bg": theme.feedbackSuccessBackground,
    "--ve-feedback-error": theme.feedbackError,
    "--ve-feedback-error-bg": theme.feedbackErrorBackground,
  };
});

const showUploadFeedback = computed(() => uploadState.value !== "idle");
const canRetryUpload = computed(() => uploadState.value === "error" && lastUploadFile.value instanceof File);
const uploadProgressDisplay = computed(() => `${Math.max(0, Math.min(100, Math.round(uploadProgress.value)))}%`);
const tableColumnHandleStyle = computed(() => ({
  top: `${tableColumnHandleTop.value}px`,
  left: `${tableColumnHandleLeft.value}px`,
}));
const tableRowHandleStyle = computed(() => ({
  top: `${tableRowHandleTop.value}px`,
  left: `${tableRowHandleLeft.value}px`,
}));
const tableColumnHighlightStyle = computed(() => ({
  top: `${tableColumnHighlightTop.value}px`,
  left: `${tableColumnHighlightLeft.value}px`,
  width: `${tableColumnHighlightWidth.value}px`,
  height: `${tableColumnHighlightHeight.value}px`,
}));
const tableRowHighlightStyle = computed(() => ({
  top: `${tableRowHighlightTop.value}px`,
  left: `${tableRowHighlightLeft.value}px`,
  width: `${tableRowHighlightWidth.value}px`,
  height: `${tableRowHighlightHeight.value}px`,
}));
const tableCornerHandleStyle = computed(() => ({
  top: `${tableCornerHandleTop.value}px`,
  left: `${tableCornerHandleLeft.value}px`,
}));
const hasLinkRestrictions = computed(() => {
  return normalizedAllowedLinkProtocols.value.length > 0 || normalizedLinkDomainWhitelist.value.length > 0;
});
const codeLanguageOptions = computed(() => CODE_LANGUAGE_OPTIONS);
const linkRestrictionHint = computed(() => {
  const hints = [];
  if (normalizedAllowedLinkProtocols.value.length) {
    hints.push(`${t("linkRestrictionProtocols")}：${normalizedAllowedLinkProtocols.value.join(", ")}`);
  }
  if (normalizedLinkDomainWhitelist.value.length) {
    hints.push(`${t("linkRestrictionDomains")}：${normalizedLinkDomainWhitelist.value.join(", ")}`);
  }
  return hints.join(" | ");
});
const isTableActive = computed(() => editor.value?.isActive("table") ?? false);
const uploadStatusLabel = computed(() => {
  if (uploadState.value === "uploading") {
    return t("uploadUploading");
  }
  if (uploadState.value === "success") {
    return t("uploadSuccess");
  }
  if (uploadState.value === "error") {
    return t("uploadError");
  }
  return t("uploadPending");
});

function t(key) {
  return messages.value[key] || key;
}

function resolveToolbarMode(item) {
  const permission = props.toolbarPermissions?.[item];
  if (permission === false || permission === "hidden") {
    return "hidden";
  }
  if (permission === "disabled") {
    return "disabled";
  }
  return "enabled";
}

const normalizedToolbar = computed(() => {
  const value = Array.isArray(props.toolbar) ? props.toolbar : DEFAULT_TOOLBAR;
  const groups = Array.isArray(value[0]) ? value : [value];

  return groups
    .map((group) =>
      group
        .filter((item) => typeof item === "string" && AVAILABLE_ITEMS.has(item))
        .map((item) => ({
          key: item,
          mode: resolveToolbarMode(item),
        }))
        .filter((item) => item.mode !== "hidden")
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

function createPasteSanitizeOptions() {
  const options = {
    ...props.sanitizeOptions,
    ...props.pasteSanitizeOptions,
  };
  const allowedTags = uniqueStringList(props.pasteWhitelistTags);
  const allowedAttrs = uniqueStringList(props.pasteWhitelistAttrs);

  if (allowedTags.length || allowedAttrs.length) {
    delete options.USE_PROFILES;
  }
  if (allowedTags.length) {
    options.ALLOWED_TAGS = allowedTags;
  }
  if (allowedAttrs.length) {
    options.ALLOWED_ATTR = allowedAttrs;
  }

  return options;
}

function sanitizePastedHTML(html) {
  if (!props.sanitize || typeof window === "undefined") {
    return html;
  }

  const result = DOMPurify.sanitize(html, createPasteSanitizeOptions());
  return typeof result === "string" ? result : "";
}

function createInitialContent() {
  return sanitizeHTML(props.modelValue || "<p></p>");
}

function normalizeUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function validateNormalizedLink(rawUrl, options = {}) {
  const url = String(rawUrl || "").trim();
  if (!url) {
    return {
      valid: false,
      reason: "empty",
      href: "",
    };
  }

  const href = options.skipNormalize ? url : normalizeUrl(url);
  let parsedUrl;

  try {
    parsedUrl = new URL(href);
  } catch {
    return {
      valid: false,
      reason: "format",
      href,
    };
  }

  const protocol = parsedUrl.protocol.replace(":", "").toLowerCase();
  if (!normalizedAllowedLinkProtocols.value.includes(protocol)) {
    return {
      valid: false,
      reason: "protocol",
      href,
    };
  }

  if ((protocol === "http" || protocol === "https") && normalizedLinkDomainWhitelist.value.length) {
    const hostname = parsedUrl.hostname.toLowerCase();
    const allowed = normalizedLinkDomainWhitelist.value.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!allowed) {
      return {
        valid: false,
        reason: "domain",
        href,
      };
    }
  }

  if (typeof props.validateLink === "function") {
    const customResult = props.validateLink({
      rawUrl: url,
      normalizedUrl: href,
      protocol,
      hostname: parsedUrl.hostname,
      url: parsedUrl,
    });

    if (customResult === false) {
      return {
        valid: false,
        reason: "custom",
        href,
      };
    }

    if (typeof customResult === "string" && customResult.trim()) {
      return {
        valid: false,
        reason: "custom",
        href,
        message: customResult.trim(),
      };
    }
  }

  return {
    valid: true,
    href,
    url: parsedUrl,
  };
}

function getLinkValidationMessage(result) {
  if (!result || result.valid) {
    return "";
  }

  if (result.message) {
    return result.message;
  }

  if (result.reason === "protocol") {
    return t("linkInvalidProtocol");
  }
  if (result.reason === "domain") {
    return t("linkInvalidDomain");
  }
  if (result.reason === "custom") {
    return t("linkInvalidCustom");
  }
  return t("linkInvalidFormat");
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
      codeBlock: false,
    }),
    Underline,
    Highlight,
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: "plaintext",
    }),
    RichImage.configure({
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      protocols: normalizedAllowedLinkProtocols.value,
      defaultProtocol: normalizedAllowedLinkProtocols.value.includes("https") ? "https" : "http",
      isAllowedUri: (url) => validateNormalizedLink(url, { skipNormalize: false }).valid,
      HTMLAttributes: {
        rel: props.linkRel,
        target: props.linkTarget,
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      emptyEditorClass: "is-editor-empty",
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Table.configure({
      resizable: true,
      cellMinWidth: 160,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
      defaultAlignment: "left",
    }),
  ],
  editorProps: {
    transformPastedHTML: (html) => sanitizePastedHTML(html),
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
    syncStructuredEditorsState(tiptapEditor);
  },
  onCreate: ({ editor: tiptapEditor }) => {
    syncImageEditorState(tiptapEditor);
    syncStructuredEditorsState(tiptapEditor);
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
    if (!value) {
      clearHoveredTableToolbar();
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("resize", refreshHoveredTablePosition);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", refreshHoveredTablePosition);
  clearTableHideTimer();
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
  taskList: "☑",
  table: "▦",
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
  taskList: (tiptapEditor) => tiptapEditor.chain().focus().toggleTaskList().run(),
  table: (tiptapEditor) => tiptapEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  horizontalRule: (tiptapEditor) => tiptapEditor.chain().focus().setHorizontalRule().run(),
  clearFormatting: (tiptapEditor) => tiptapEditor.chain().focus().unsetAllMarks().clearNodes().run(),
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

function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
}

function runTableCommandFromHoveredCell(commandName) {
  const tiptapEditor = editor.value;
  const cell = hoveredTableCellElement.value;
  if (!tiptapEditor || !(cell instanceof HTMLElement)) {
    return;
  }

  const cellPos = tiptapEditor.view.posAtDOM(cell, 0);
  const insideCellPos = Math.max(1, cellPos + 1);
  tiptapEditor.chain().focus().setTextSelection(insideCellPos)[commandName]().run();
  refreshHoveredTablePosition();
}

function addTableRow() {
  runTableCommandFromHoveredCell("addRowAfter");
}

function removeTableRow() {
  runTableCommandFromHoveredCell("deleteRow");
}

function addTableColumn() {
  runTableCommandFromHoveredCell("addColumnAfter");
}

function removeTableColumn() {
  runTableCommandFromHoveredCell("deleteColumn");
}

function toggleTableHeader() {
  runTableCommandFromHoveredCell("toggleHeaderRow");
}

function deleteTable() {
  runTableCommandFromHoveredCell("deleteTable");
  clearHoveredTableToolbar();
}

function applyCodeLanguage() {
  const tiptapEditor = editor.value;
  if (!tiptapEditor || !tiptapEditor.isActive("codeBlock")) {
    return;
  }

  const language = codeLanguage.value === "plaintext" ? null : codeLanguage.value;
  tiptapEditor.chain().focus().updateAttributes("codeBlock", { language }).run();
}

function resolveTableElementFromTarget(target) {
  if (!(target instanceof Node)) {
    return null;
  }

  const element = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;
  return element instanceof HTMLElement ? element.closest("table") : null;
}

function resolveTableCellElementFromTarget(target) {
  if (!(target instanceof Node)) {
    return null;
  }

  const element = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;
  return element instanceof HTMLElement ? element.closest("td, th") : null;
}

function resolveTableElementFromSelection(tiptapEditor) {
  if (!tiptapEditor?.isActive("table")) {
    return null;
  }

  const domNode = tiptapEditor.view.domAtPos(tiptapEditor.state.selection.from).node;
  return resolveTableElementFromTarget(domNode);
}

function resolveTableCellElementFromSelection(tiptapEditor) {
  if (!tiptapEditor?.isActive("table")) {
    return null;
  }

  const domNode = tiptapEditor.view.domAtPos(tiptapEditor.state.selection.from).node;
  return resolveTableCellElementFromTarget(domNode);
}

function refreshHoveredTablePosition() {
  const table = hoveredTableElement.value;
  const cell = hoveredTableCellElement.value;
  const stage = editorStageRef.value;
  if (!(table instanceof HTMLElement) || !(cell instanceof HTMLElement) || !(stage instanceof HTMLElement)) {
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();

  tableColumnHandleTop.value = Math.max(8, cellRect.top - stageRect.top - 12);
  tableColumnHandleLeft.value = Math.max(18, cellRect.left - stageRect.left + cellRect.width / 2);
  tableRowHandleTop.value = Math.max(18, cellRect.top - stageRect.top + cellRect.height / 2);
  tableRowHandleLeft.value = Math.max(8, cellRect.left - stageRect.left - 12);
  tableColumnHighlightTop.value = Math.max(0, tableRect.top - stageRect.top);
  tableColumnHighlightLeft.value = Math.max(0, cellRect.left - stageRect.left);
  tableColumnHighlightWidth.value = Math.max(0, cellRect.width);
  tableColumnHighlightHeight.value = Math.max(0, tableRect.height);
  tableRowHighlightTop.value = Math.max(0, cellRect.top - stageRect.top);
  tableRowHighlightLeft.value = Math.max(0, tableRect.left - stageRect.left);
  tableRowHighlightWidth.value = Math.max(0, tableRect.width);
  tableRowHighlightHeight.value = Math.max(0, cellRect.height);
  tableCornerHandleTop.value = Math.max(8, tableRect.top - stageRect.top + 6);
  tableCornerHandleLeft.value = Math.max(8, tableRect.left - stageRect.left + 6);
}

function clearTableHideTimer() {
  if (tableHideTimer.value) {
    window.clearTimeout(tableHideTimer.value);
    tableHideTimer.value = null;
  }
}

function scheduleHideTableToolbar() {
  clearTableHideTimer();
  tableHideTimer.value = window.setTimeout(() => {
    if (!editor.value?.isActive("table") && !isPointerOverTable.value && !isPointerOverTableControls.value) {
      clearHoveredTableToolbar();
    }
  }, 90);
}

function clearHoveredTableToolbar() {
  clearTableHideTimer();
  isPointerOverTable.value = false;
  hoveredTableElement.value = null;
  hoveredTableCellElement.value = null;
  showTableHandles.value = false;
}

function setHoveredTableElement(table, cell) {
  if (!(table instanceof HTMLElement) || !(cell instanceof HTMLElement) || !props.editable) {
    clearHoveredTableToolbar();
    return;
  }

  clearTableHideTimer();
  hoveredTableElement.value = table;
  hoveredTableCellElement.value = cell;
  showTableHandles.value = true;
  refreshHoveredTablePosition();
}

function handleEditorPointerMove(event) {
  const table = resolveTableElementFromTarget(event.target);
  const cell = resolveTableCellElementFromTarget(event.target);
  if (table && cell) {
    isPointerOverTable.value = true;
    if (hoveredTableElement.value !== table || hoveredTableCellElement.value !== cell || !showTableHandles.value) {
      setHoveredTableElement(table, cell);
    }
    return;
  }

  isPointerOverTable.value = false;
  if (!editor.value?.isActive("table")) {
    scheduleHideTableToolbar();
  }
}

function handleEditorPointerLeave() {
  isPointerOverTable.value = false;
  if (!editor.value?.isActive("table")) {
    scheduleHideTableToolbar();
  }
}

function handleTableControlsEnter() {
  isPointerOverTableControls.value = true;
  clearTableHideTimer();
}

function handleTableControlsLeave() {
  isPointerOverTableControls.value = false;
  if (!editor.value?.isActive("table")) {
    scheduleHideTableToolbar();
  }
}

function getSelectedImagePosition(tiptapEditor) {
  if (!tiptapEditor) {
    return null;
  }

  const { selection, doc } = tiptapEditor.state;

  if (selection instanceof NodeSelection && selection.node?.type?.name === "image") {
    return selection.from;
  }

  let foundPos = null;
  doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === "image") {
      foundPos = pos;
      return false;
    }
    return undefined;
  });

  return foundPos;
}

function syncStructuredEditorsState(tiptapEditor) {
  const hasCodeBlock = tiptapEditor?.isActive("codeBlock") ?? false;
  const selectedTable = resolveTableElementFromSelection(tiptapEditor);
  const selectedCell = resolveTableCellElementFromSelection(tiptapEditor);

  showCodeEditor.value = hasCodeBlock;

  if (selectedTable && selectedCell) {
    setHoveredTableElement(selectedTable, selectedCell);
  } else if (!isPointerOverTable.value) {
    clearHoveredTableToolbar();
  }

  if (!hasCodeBlock) {
    codeLanguage.value = "plaintext";
    return;
  }

  const language = tiptapEditor.getAttributes("codeBlock")?.language || "plaintext";
  codeLanguage.value = language;
}

function syncImageEditorState(tiptapEditor) {
  const imagePos = getSelectedImagePosition(tiptapEditor);
  if (imagePos === null) {
    currentImagePos.value = null;
    showImageEditor.value = false;
    return;
  }

  currentImagePos.value = imagePos;
  const attrs = tiptapEditor.state.doc.nodeAt(imagePos)?.attrs || {};
  const width = normalizeImageWidthValue(attrs.width || "100%");
  const float = normalizeImageFloat(attrs.float || "none");

  showImageEditor.value = true;
  imageCustomWidth.value = width;
  imageWidthPreset.value = IMAGE_WIDTH_PRESETS.includes(width) ? width : "custom";
  imageFloat.value = float;
}

function applyImageAttrs(attrs) {
  const tiptapEditor = editor.value;
  if (!tiptapEditor || currentImagePos.value === null) {
    return;
  }

  tiptapEditor.chain().focus().setNodeSelection(currentImagePos.value).updateAttributes("image", attrs).run();
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
  if (!tiptapEditor || currentImagePos.value === null) {
    return;
  }

  tiptapEditor.chain().focus().setNodeSelection(currentImagePos.value).deleteSelection().run();
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
    taskList: "taskList",
    table: "table",
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

function isButtonDisabled(item, mode = "enabled") {
  if (mode === "disabled") {
    return true;
  }

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

function clearLinkValidationError() {
  linkValidationMessage.value = "";
}

function openLinkEditor() {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  linkUrl.value = tiptapEditor.getAttributes("link").href || "";
  linkValidationMessage.value = "";
  showLinkEditor.value = true;
}

function applyLink() {
  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  const rawValue = linkUrl.value.trim();
  if (!rawValue) {
    tiptapEditor.chain().focus().unsetLink().run();
    closeLinkEditor();
    return;
  }

  const validation = validateNormalizedLink(rawValue);
  if (!validation.valid) {
    linkValidationMessage.value = getLinkValidationMessage(validation);
    return;
  }

  tiptapEditor.chain().focus().extendMarkRange("link").setLink({ href: validation.href }).run();
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
  linkValidationMessage.value = "";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dismissUploadFeedback() {
  uploadState.value = "idle";
  uploadProgress.value = 0;
  uploadMessage.value = "";
}

function setUploadProgress(value) {
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) {
    return;
  }

  uploadProgress.value = Math.max(uploadProgress.value, Math.min(100, Math.round(nextValue)));
  emit("image-upload-progress", uploadProgress.value);
}

async function insertImageFromFile(file) {
  if (!file || !props.editable) {
    return;
  }

  const tiptapEditor = editor.value;
  if (!tiptapEditor) {
    return;
  }

  lastUploadFile.value = file;
  uploadState.value = "uploading";
  uploadProgress.value = 0;
  uploadMessage.value = `${t("uploadPendingMessage")} ${file.name}`;
  emit("image-upload-start", file);

  try {
    const uploadContext = {
      onProgress: (progress) => setUploadProgress(progress),
    };
    const result = props.uploadImage ? await props.uploadImage(file, uploadContext) : await fileToDataUrl(file);
    const src =
      typeof result === "string"
        ? result.trim()
        : typeof result?.url === "string"
          ? result.url.trim()
          : typeof result?.src === "string"
            ? result.src.trim()
            : "";

    if (!src) {
      throw new Error("uploadImage must return a non-empty string URL or { url } object");
    }

    uploadProgress.value = 100;
    uploadState.value = "success";
    uploadMessage.value = t("uploadSuccessMessage");

    tiptapEditor.chain().focus().setImage({ src, width: "100%", float: "none" }).run();
    syncImageEditorState(tiptapEditor);
    emit("image-upload-success", src);
  } catch (error) {
    uploadState.value = "error";
    uploadMessage.value = error instanceof Error && error.message ? error.message : t("uploadError");
    emit("image-upload-error", error);
  }
}

async function retryLastImageUpload() {
  if (!(lastUploadFile.value instanceof File)) {
    return;
  }

  await insertImageFromFile(lastUploadFile.value);
}

async function onFileChange(event) {
  const file = event?.target?.files?.[0];
  event.target.value = "";

  if (!file) {
    return;
  }

  await insertImageFromFile(file);
}

defineExpose({
  editor,
  getHTML: () => sanitizeHTML(editor.value?.getHTML() ?? ""),
  getJSON: () => editor.value?.getJSON() ?? null,
  setHTML: (content) => editor.value?.commands.setContent(sanitizeHTML(content || "<p></p>"), false),
  clear: () => editor.value?.commands.clearContent(true),
  focus: () => editor.value?.chain().focus().run(),
  insertTable,
  retryLastImageUpload,
});
</script>

<style scoped>
.vue-editor {
  border: 1px solid var(--ve-border-color);
  border-radius: 8px;
  background: var(--ve-editor-bg);
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
  border-bottom: 1px solid var(--ve-toolbar-border);
  background: var(--ve-toolbar-bg);
}

.toolbar-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-right: 8px;
  border-right: 1px solid var(--ve-group-border);
}

.toolbar-group:last-child {
  border-right: none;
  padding-right: 0;
}

.toolbar-select,
.toolbar-btn,
.link-btn {
  border: 1px solid var(--ve-btn-border);
  background: var(--ve-btn-bg);
  border-radius: 6px;
  color: var(--ve-btn-text);
  font-size: 13px;
  line-height: 1;
  padding: 8px 10px;
  cursor: pointer;
}

.toolbar-select {
  min-width: 110px;
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
  top: calc(100% + 8px);
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  line-height: 1;
  padding: 7px 8px;
  color: #ffffff;
  background: var(--ve-tooltip-bg);
  border-radius: 5px;
  pointer-events: none;
  z-index: 20;
}

.toolbar-btn[data-tooltip]:hover::before {
  position: absolute;
  content: "";
  left: 50%;
  top: calc(100% + 2px);
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: var(--ve-tooltip-bg);
  pointer-events: none;
  z-index: 20;
}

.toolbar-btn:hover,
.toolbar-select:hover,
.link-btn:hover,
.image-select:hover,
.image-input:hover,
.image-float-btn:hover,
.link-input:hover {
  border-color: var(--ve-btn-hover-border);
}

.toolbar-btn.active,
.image-float-btn.active {
  border-color: var(--ve-btn-active-border);
  background: var(--ve-btn-active-bg);
  color: var(--ve-btn-active-text);
}

.toolbar-btn:disabled,
.toolbar-select:disabled,
.link-btn:disabled {
  opacity: var(--ve-btn-disabled-opacity);
  cursor: not-allowed;
}

.link-editor,
.image-editor,
.code-editor,
.upload-feedback {
  padding: 10px;
  border-bottom: 1px solid var(--ve-toolbar-border);
  background: var(--ve-panel-bg);
}

.link-editor {
  display: grid;
  gap: 8px;
}

.link-editor-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.link-feedback {
  margin: 0;
  font-size: 12px;
  color: var(--ve-muted-text);
}

.link-feedback.is-error {
  color: var(--ve-feedback-error);
}

.link-input {
  flex: 1;
  min-width: 160px;
  border: 1px solid var(--ve-btn-border);
  background: var(--ve-btn-bg);
  color: var(--ve-btn-text);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}

.link-input:focus,
.image-input:focus,
.image-select:focus,
.toolbar-select:focus {
  outline: none;
  border-color: var(--ve-btn-active-border);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ve-btn-active-border) 18%, transparent);
}

.link-btn.primary {
  border-color: var(--ve-primary-bg);
  background: var(--ve-primary-bg);
  color: var(--ve-primary-text);
}

.upload-feedback {
  display: grid;
  gap: 8px;
}

.upload-feedback.is-success {
  background: var(--ve-feedback-success-bg);
  color: var(--ve-feedback-success);
}

.upload-feedback.is-error {
  background: var(--ve-feedback-error-bg);
  color: var(--ve-feedback-error);
}

.upload-feedback.is-uploading {
  color: var(--ve-btn-text);
}

.upload-feedback-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.upload-feedback-title {
  font-size: 13px;
}

.upload-feedback-progress,
.upload-feedback-message {
  font-size: 12px;
}

.upload-feedback-message {
  margin: 0;
}

.upload-progress {
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--ve-progress-bg);
}

.upload-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ve-progress-bar);
  transition: width 0.2s ease;
}

.upload-feedback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-editor,
.code-editor {
  display: grid;
  gap: 8px;
}

.image-editor-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.image-editor-label {
  font-size: 12px;
  color: var(--ve-muted-text);
  min-width: 62px;
}

.image-select,
.image-input,
.image-float-btn {
  border: 1px solid var(--ve-btn-border);
  border-radius: 6px;
  background: var(--ve-btn-bg);
  color: var(--ve-btn-text);
  font-size: 12px;
  padding: 7px 9px;
}

.image-input {
  min-width: 110px;
}

.editor-stage {
  position: relative;
  min-height: inherit;
}

.editor-body {
  padding: 14px;
  background: var(--ve-editor-bg);
}

.table-column-highlight,
.table-row-highlight {
  position: absolute;
  z-index: 6;
  pointer-events: none;
  border-radius: 8px;
  background: color-mix(in srgb, var(--ve-btn-active-border) 10%, transparent);
}

.table-corner-handle,
.table-column-handle,
.table-row-handle {
  position: absolute;
  z-index: 15;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(8px);
}

.table-corner-handle {
  gap: 4px;
}

.table-column-handle {
  transform: translate(-50%, -50%);
}

.table-row-handle {
  flex-direction: column;
  transform: translate(-50%, -50%);
}

.table-handle-btn {
  width: 24px;
  height: 24px;
  border: 1px solid var(--ve-btn-border);
  border-radius: 999px;
  background: var(--ve-btn-bg);
  color: var(--ve-btn-text);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.table-handle-btn:hover {
  border-color: var(--ve-btn-active-border);
  color: var(--ve-btn-active-text);
}

.table-handle-btn.danger {
  color: #b91c1c;
}

.hidden-file-input {
  display: none;
}

:deep(.ProseMirror) {
  min-height: inherit;
  outline: none;
  color: var(--ve-editor-text);
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
  border-left: 4px solid var(--ve-blockquote-border);
  margin-left: 0;
  padding: 8px 12px;
  color: var(--ve-editor-text);
  background: var(--ve-blockquote-bg);
}

:deep(.ProseMirror pre) {
  background: var(--ve-code-bg);
  color: var(--ve-code-text);
  border-radius: 6px;
  padding: 10px 12px;
  overflow-x: auto;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 22px;
}

:deep(.ProseMirror ul[data-type="taskList"]) {
  list-style: none;
  padding-left: 0;
}

:deep(.ProseMirror ul[data-type="taskList"] li) {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 28px;
}

:deep(.ProseMirror ul[data-type="taskList"] li > label) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  margin-top: 0;
  flex: 0 0 auto;
}

:deep(.ProseMirror ul[data-type="taskList"] li > label input) {
  margin: 0;
}

:deep(.ProseMirror ul[data-type="taskList"] li > div) {
  flex: 1;
}

:deep(.ProseMirror ul[data-type="taskList"] li > div > p:last-child) {
  margin-bottom: 0;
}

:deep(.ProseMirror a) {
  color: var(--ve-link-color);
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

:deep(.ProseMirror .tableWrapper) {
  margin: 0 0 14px;
  overflow-x: auto;
}

:deep(.ProseMirror table) {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
  background: #ffffff;
}

:deep(.ProseMirror th),
:deep(.ProseMirror td) {
  border: 1px solid #dbe3ee;
  padding: 10px 12px;
  vertical-align: top;
}

:deep(.ProseMirror th) {
  background: #f8fafc;
  font-weight: 700;
}

:deep(.ProseMirror pre code) {
  color: inherit;
}

:deep(.ProseMirror .hljs-comment),
:deep(.ProseMirror .hljs-quote) {
  color: #94a3b8;
}

:deep(.ProseMirror .hljs-keyword),
:deep(.ProseMirror .hljs-selector-tag),
:deep(.ProseMirror .hljs-literal) {
  color: #fca5a5;
}

:deep(.ProseMirror .hljs-string),
:deep(.ProseMirror .hljs-attr) {
  color: #86efac;
}

:deep(.ProseMirror .hljs-title),
:deep(.ProseMirror .hljs-function),
:deep(.ProseMirror .hljs-section) {
  color: #93c5fd;
}

:deep(.ProseMirror .hljs-number),
:deep(.ProseMirror .hljs-symbol),
:deep(.ProseMirror .hljs-built_in) {
  color: #fcd34d;
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

@media (max-width: 720px) {
  .link-editor-row,
  .image-editor-row,
  .upload-feedback-head {
    align-items: flex-start;
  }

  .link-input {
    min-width: 0;
    width: 100%;
  }
}
</style>
