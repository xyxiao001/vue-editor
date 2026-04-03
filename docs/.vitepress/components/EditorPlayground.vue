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

      <label>
        示例模板:
        <select v-model="selectedTemplateId" @change="applySelectedTemplate">
          <option v-for="item in templates" :key="item.id" :value="item.id">
            {{ item.label }}
          </option>
        </select>
      </label>

      <button type="button" @click="applySelectedTemplate">应用模板</button>
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
          placeholder="在这里输入内容，尝试图标工具栏、图片尺寸与浮动"
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

const templates = [
  {
    id: "announcement",
    label: "公告通知模板",
    html: [
      "<h2>平台功能升级公告</h2>",
      "<p><strong>发布时间：</strong>2026-04-03 18:30</p>",
      "<p>本次升级包含编辑器工具栏增强、图片尺寸调整和浮动排版能力。</p>",
      "<blockquote>建议运营同学优先体验新模板能力并反馈可用性。</blockquote>",
      "<ul><li>支持复杂图文排版</li><li>支持实时 HTML 预览</li><li>支持渲染效果预览</li></ul>",
      "<p>如有问题请联系产品技术支持群。</p>",
    ].join(""),
  },
  {
    id: "tech-doc",
    label: "技术文档模板",
    html: [
      "<h2>富文本 SDK 接入指南</h2>",
      "<h3>1. 安装依赖</h3>",
      "<pre><code>npm install vue-editor-prose-kit</code></pre>",
      "<h3>2. 注册组件</h3>",
      "<pre><code>import { VueEditor } from 'vue-editor-prose-kit'</code></pre>",
      "<h3>3. 常见问题</h3>",
      "<ol><li>图片上传失败时监听 <code>image-upload-error</code></li><li>通过 toolbar 配置精简按钮集合</li></ol>",
      "<p>更多 API 见文档章节。</p>",
    ].join(""),
  },
  {
    id: "marketing",
    label: "营销图文模板",
    html: [
      "<h2>春季新品发布</h2>",
      "<p>新品系列正式上线，主打轻量化与高性能。</p>",
      "<p><img src='https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1100&q=80' data-width='42%' data-float='left' style='width:42%;max-width:100%;float:left;margin:8px 16px 12px 0;' alt='banner'/>新品支持模块化能力组合，适配不同规模业务场景。你可以在编辑器中继续修改这张图片的尺寸，以及调整左右浮动来实现图文环绕效果。</p>",
      "<p>活动期间购买可享受企业专属折扣与迁移支持。</p>",
      "<p><img src='https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80' data-width='55%' data-float='center' style='width:55%;max-width:100%;float:none;display:block;margin:10px auto;' alt='product' /></p>",
      "<p style='text-align:center'><a href='https://example.com'>点击查看完整活动页</a></p>",
    ].join(""),
  },
  {
    id: "event-review",
    label: "活动复盘模板",
    html: [
      "<h2>季度活动复盘</h2>",
      "<p>本季度共完成 3 场线上活动，累计触达用户 12 万。</p>",
      "<h3>核心数据</h3>",
      "<ul><li>报名转化率：24.8%</li><li>直播完播率：61.3%</li><li>新增线索：3,482</li></ul>",
      "<h3>经验总结</h3>",
      "<blockquote>图文混排 + 重点数据高亮可以显著提升阅读效率。</blockquote>",
      "<p>下阶段重点优化素材生产流程和活动分发渠道。</p>",
    ].join(""),
  },
];

const selectedTemplateId = ref(templates[0].id);
const content = ref(templates[0].html);

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

function applySelectedTemplate() {
  const selected = templates.find((item) => item.id === selectedTemplateId.value);
  if (!selected) {
    return;
  }

  content.value = selected.html;
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
