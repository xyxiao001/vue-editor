<template>
  <div class="editor-doc-shell">
    <div class="editor-controls">
      <label>
        Locale:
        <select v-model="locale">
          <option value="zh-CN">zh-CN</option>
          <option value="en-US">en-US</option>
        </select>
      </label>

      <label>
        <input v-model="editable" type="checkbox" />
        Editable
      </label>

      <button type="button" @click="setDemoTemplate">填充示例内容</button>
      <button type="button" @click="clearContent">清空</button>
    </div>

    <div class="editor-workspace">
      <section class="editor-pane">
        <h3>富文本编辑</h3>
        <VueEditor
          ref="editorRef"
          v-model="content"
          :locale="locale"
          :editable="editable"
          :upload-image="mockUploadImage"
          :min-height="460"
          placeholder="在这里输入内容，尝试图标工具栏、链接和图片上传"
          @image-upload-error="onUploadError"
        />
      </section>

      <section class="preview-pane">
        <div class="preview-header">
          <h3>预览面板</h3>
          <div class="preview-tabs">
            <button type="button" :class="{ active: previewMode === 'html' }" @click="previewMode = 'html'">
              HTML 源码
            </button>
            <button type="button" :class="{ active: previewMode === 'render' }" @click="previewMode = 'render'">
              渲染效果
            </button>
          </div>
        </div>

        <pre v-if="previewMode === 'html'" class="editor-output">{{ formattedHtml }}</pre>
        <div v-else class="rendered-output" v-html="safeRenderedHtml"></div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import DOMPurify from "dompurify";

const editorRef = ref(null);
const locale = ref("zh-CN");
const editable = ref(true);
const previewMode = ref("html");

const content = ref("<h2>富文本在线预览</h2><p>你可以直接在文档里操作编辑器，并查看源码和渲染结果。</p>");

const formattedHtml = computed(() => {
  const html = content.value || "";
  return html
    .replace(/></g, ">\n<")
    .replace(/\n\s*\n/g, "\n")
    .trim();
});

const safeRenderedHtml = computed(() => {
  return DOMPurify.sanitize(content.value || "", {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
  });
});

function setDemoTemplate() {
  content.value = [
    "<h2>编辑器公告示例</h2>",
    "<p>这是一个带 <strong>加粗</strong>、<em>斜体</em>、<u>下划线</u> 和 <a href='https://example.com'>链接</a> 的段落。</p>",
    "<blockquote>支持引用、列表、代码块、对齐、图片和链接编辑。</blockquote>",
    "<ul><li>图标工具栏</li><li>HTML 源码预览</li><li>渲染结果预览</li></ul>",
  ].join("");
}

function clearContent() {
  editorRef.value?.clear();
}

function mockUploadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Only image files are allowed."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image read failed."));
    reader.readAsDataURL(file);
  });
}

function onUploadError(error) {
  console.error("image upload error", error);
}
</script>
