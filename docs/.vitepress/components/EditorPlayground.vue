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
        Toolbar Theme:
        <select v-model="toolbarTheme">
          <option value="light">light</option>
          <option value="slate">slate</option>
          <option value="sand">sand</option>
        </select>
      </label>

      <label>
        Permission Preset:
        <select v-model="permissionPresetId">
          <option v-for="item in permissionPresets" :key="item.id" :value="item.id">
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="template-select-label">
        示例模板:
        <select v-model="selectedTemplateId" @change="applySelectedTemplate">
          <option v-for="item in templates" :key="item.id" :value="item.id">
            {{ item.label }}
          </option>
        </select>
      </label>

      <label>
        <input v-model="simulateUploadFailure" type="checkbox" />
        Simulate Upload Failure
      </label>

      <button type="button" @click="applySelectedTemplate">应用模板</button>
      <button type="button" @click="clearContent">清空</button>
    </div>

    <p class="editor-note">
      模板保留为顶部单选入口，首屏优先展示编辑器。链接仅允许 `https`、`mailto`，且域名白名单限定为 `example.com`、`openai.com`。
    </p>

    <div class="editor-workspace">
      <section class="editor-pane">
        <div class="pane-header">
          <div>
            <p class="eyebrow">Editor</p>
            <h3>富文本编辑</h3>
          </div>
          <div class="pane-meta">
            <span>{{ currentTemplate.label }}</span>
            <span>{{ currentTemplate.categoryLabel }}</span>
          </div>
        </div>

        <div class="template-spotlight">
          <div class="template-spotlight-copy">
            <strong>{{ currentTemplate.label }}</strong>
            <p>{{ currentTemplate.summary }}</p>
          </div>
          <div class="template-spotlight-tags">
            <span v-for="tag in currentTemplate.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <VueEditor
          ref="editorRef"
          v-model="content"
          :locale="locale"
          :editable="editable"
          :toolbar-theme="toolbarTheme"
          :toolbar-permissions="currentToolbarPermissions"
          :upload-image="mockUploadImage"
          :allowed-link-protocols="['https', 'mailto']"
          :link-domain-whitelist="['example.com', 'openai.com']"
          :paste-whitelist-tags="pasteWhitelistTags"
          :paste-whitelist-attrs="pasteWhitelistAttrs"
          :min-height="500"
          placeholder="在这里输入内容，尝试复杂模板、表格悬浮工具条、代码高亮和上传进度"
          @image-upload-error="onUploadError"
        />
      </section>

      <section class="preview-pane">
        <div class="preview-header">
          <div>
            <p class="eyebrow">Preview</p>
            <h3>预览面板</h3>
          </div>
          <div class="preview-tabs">
            <button type="button" :class="{ active: previewMode === 'html' }" @click="previewMode = 'html'">
              HTML 源码
            </button>
            <button type="button" :class="{ active: previewMode === 'render' }" @click="previewMode = 'render'">
              渲染效果
            </button>
          </div>
        </div>

        <div class="content-stats">
          <span>{{ contentStats.characters }} chars</span>
          <span>{{ contentStats.blocks }} blocks</span>
          <span>{{ contentStats.images }} images</span>
          <span>{{ contentStats.links }} links</span>
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
const toolbarTheme = ref("light");
const simulateUploadFailure = ref(false);

const permissionPresets = [
  {
    id: "full",
    label: "完整工具栏",
    permissions: {},
  },
  {
    id: "review",
    label: "审核模式",
    permissions: {
      image: false,
      clearFormatting: false,
      link: "disabled",
    },
  },
  {
    id: "ops",
    label: "运营排版",
    permissions: {
      clearFormatting: false,
      undo: true,
      redo: true,
    },
  },
  {
    id: "lite",
    label: "轻量编辑",
    permissions: {
      highlight: false,
      horizontalRule: false,
      alignJustify: false,
    },
  },
];

const templates = [
  {
    id: "product-launch",
    categoryLabel: "营销图文",
    label: "新品发布长图文",
    summary: "包含首图、亮点清单、对比表格和行动按钮，适合验证图文混排与 CTA。",
    tags: ["图片", "表格", "CTA"],
    html: [
      "<h2>2026 春季产品发布</h2>",
      "<p><strong>主题：</strong>更轻、更快、更容易接入业务系统的富文本组件。</p>",
      "<p><img src='https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80' data-width='46%' data-float='right' style='width:46%;max-width:100%;float:right;margin:8px 0 12px 16px;' alt='launch'/>这次版本重点不是增加零散小功能，而是把编辑器的输入链路、图片能力、表格交互和在线预览真正连成一套可直接交付的体验。右侧的图片可以继续在编辑器里修改尺寸、浮动和布局方式。</p>",
      "<blockquote>建议把这个模板当成活动页首稿，先完成内容结构，再进入视觉和投放阶段。</blockquote>",
      "<h3>核心亮点</h3>",
      "<ul><li>支持图片上传进度与失败重试</li><li>支持链接协议和域名白名单</li><li>支持表格、任务列表与代码高亮</li></ul>",
      "<h3>能力对比</h3>",
      "<table><thead><tr><th>模块</th><th>旧体验</th><th>当前体验</th></tr></thead><tbody><tr><td>图片</td><td>仅插入</td><td>可调整宽度与位置</td></tr><tr><td>表格</td><td>静态插入</td><td>悬浮操作栏</td></tr><tr><td>预览</td><td>单一源码</td><td>HTML + 渲染双视图</td></tr></tbody></table>",
      "<p style='text-align:center'><a href='https://openai.com'>查看完整活动介绍</a></p>",
    ].join(""),
  },
  {
    id: "implementation-guide",
    categoryLabel: "文档手册",
    label: "复杂接入指南",
    summary: "组合代码块、接口说明表和注意事项，适合验证技术文档排版。",
    tags: ["代码块", "说明", "清单"],
    html: [
      "<h2>编辑器接入指南</h2>",
      "<p>这个模板面向组件接入文档，目标是同时覆盖安装、配置、限制条件和验收动作。</p>",
      "<h3>1. 安装依赖</h3>",
      "<pre><code class='language-bash'>npm install vue-editor-prose-kit</code></pre>",
      "<h3>2. 推荐配置</h3>",
      "<pre><code class='language-javascript'>const toolbar = [\n  ['blockType'],\n  ['bold', 'italic', 'underline', 'highlight'],\n  ['bulletList', 'orderedList', 'taskList', 'table'],\n  ['link', 'image'],\n]</code></pre>",
      "<h3>3. 接入约束</h3>",
      "<table><thead><tr><th>项</th><th>推荐值</th><th>说明</th></tr></thead><tbody><tr><td>allowedLinkProtocols</td><td>https, mailto</td><td>避免不安全协议</td></tr><tr><td>pasteWhitelistTags</td><td>按业务白名单配置</td><td>减少粘贴污染</td></tr><tr><td>uploadImage</td><td>支持 onProgress</td><td>提升上传反馈</td></tr></tbody></table>",
      "<h3>4. 上线前检查</h3>",
      "<ul data-type='taskList'><li data-type='taskItem' data-checked='true'><label><input type='checkbox' checked='checked'><span></span></label><div><p>确认图片上传接口可用</p></div></li><li data-type='taskItem' data-checked='false'><label><input type='checkbox'><span></span></label><div><p>确认域名白名单覆盖所有生产链接</p></div></li><li data-type='taskItem' data-checked='false'><label><input type='checkbox'><span></span></label><div><p>确认粘贴过滤与服务端白名单一致</p></div></li></ul>",
    ].join(""),
  },
  {
    id: "ops-campaign",
    categoryLabel: "运营排期",
    label: "活动执行方案",
    summary: "同时包含任务列表、时间表和插图说明，适合运营同学直接修改使用。",
    tags: ["任务", "排期", "图文"],
    html: [
      "<h2>618 专题活动执行方案</h2>",
      "<p><img src='https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80' data-width='42%' data-float='left' style='width:42%;max-width:100%;float:left;margin:8px 16px 12px 0;' alt='campaign'/>这个模板把活动执行需要的节奏、角色和素材要求放在同一页里，方便在评审会里边看边改。图片建议保留左浮动状态，这样首屏信息密度更高。</p>",
      "<h3>执行清单</h3>",
      "<ul data-type='taskList'><li data-type='taskItem' data-checked='true'><label><input type='checkbox' checked='checked'><span></span></label><div><p>完成主会场头图与站内 banner</p></div></li><li data-type='taskItem' data-checked='true'><label><input type='checkbox' checked='checked'><span></span></label><div><p>确认投放资源位与追踪参数</p></div></li><li data-type='taskItem' data-checked='false'><label><input type='checkbox'><span></span></label><div><p>补充客服 FAQ 与退款说明</p></div></li><li data-type='taskItem' data-checked='false'><label><input type='checkbox'><span></span></label><div><p>检查移动端首屏图文比例</p></div></li></ul>",
      "<h3>排期表</h3>",
      "<table><thead><tr><th>时间</th><th>动作</th><th>负责人</th></tr></thead><tbody><tr><td>D-7</td><td>完成页面初稿</td><td>运营</td></tr><tr><td>D-3</td><td>内容审核与法务确认</td><td>产品 / 法务</td></tr><tr><td>D-1</td><td>预发联调和素材替换</td><td>前端</td></tr></tbody></table>",
      "<p><a href='https://example.com/campaign'>查看完整活动资产清单</a></p>",
    ].join(""),
  },
  {
    id: "weekly-report",
    categoryLabel: "复盘报告",
    label: "项目周报复盘",
    summary: "适合项目周报、风险同步和下周计划，覆盖指标、代码和任务项。",
    tags: ["周报", "复盘", "代码"],
    html: [
      "<h2>编辑器项目周报</h2>",
      "<p><strong>时间范围：</strong>2026-04-01 至 2026-04-08</p>",
      "<h3>本周成果</h3>",
      "<ul><li>完成主题、权限和粘贴白名单的基础治理</li><li>补充表格、任务列表和代码高亮能力</li><li>重构在线预览为首屏优先的编辑体验</li></ul>",
      "<h3>关键代码</h3>",
      "<pre><code class='language-typescript'>editor.chain().focus().insertTable({\n  rows: 3,\n  cols: 3,\n  withHeaderRow: true,\n}).run()</code></pre>",
      "<h3>风险与行动</h3>",
      "<table><thead><tr><th>风险</th><th>影响</th><th>动作</th></tr></thead><tbody><tr><td>Markdown 互通未完成</td><td>影响内容迁移</td><td>进入下一阶段实现</td></tr><tr><td>文档 chunk 偏大</td><td>影响首屏加载</td><td>后续拆包优化</td></tr></tbody></table>",
      "<blockquote>这一版更适合拿去做真实业务接入验证，而不是停留在功能演示层面。</blockquote>",
    ].join(""),
  },
  {
    id: "support-center",
    categoryLabel: "服务支持",
    label: "帮助中心文档",
    summary: "把 FAQ、排查步骤、示例链接放在一页里，适合客服和实施团队复用。",
    tags: ["FAQ", "帮助", "链接"],
    html: [
      "<h2>帮助中心常见问题</h2>",
      "<h3>为什么上传后图片没有显示？</h3>",
      "<p>请先检查上传接口返回值是否为可访问的图片 URL；如果是私有源站，请确认已经经过签名或 CDN 映射。</p>",
      "<h3>为什么链接保存失败？</h3>",
      "<p>编辑器会校验协议和域名白名单，比如 `https://example.com` 可以保存，但未配置的域名不会写入内容。</p>",
      "<h3>排查步骤</h3>",
      "<ol><li>检查网络请求是否成功</li><li>检查 `uploadImage` 是否正确调用 `onProgress`</li><li>检查 `allowedLinkProtocols` 与 `linkDomainWhitelist` 配置</li></ol>",
      "<h3>参考资源</h3>",
      "<table><thead><tr><th>资源</th><th>用途</th></tr></thead><tbody><tr><td><a href='https://example.com/help/upload'>上传说明</a></td><td>排查图片上传问题</td></tr><tr><td><a href='https://example.com/help/link-policy'>链接策略</a></td><td>查看域名白名单规则</td></tr></tbody></table>",
    ].join(""),
  },
];

const pasteWhitelistTags = ["a", "blockquote", "br", "code", "col", "colgroup", "em", "h1", "h2", "h3", "hr", "img", "input", "label", "li", "ol", "p", "pre", "strong", "table", "tbody", "td", "th", "thead", "tr", "u", "ul"];
const pasteWhitelistAttrs = ["alt", "checked", "class", "colspan", "data-checked", "data-float", "data-type", "data-width", "href", "rel", "rowspan", "src", "target", "title", "type"];

const selectedTemplateId = ref(templates[0].id);
const permissionPresetId = ref(permissionPresets[0].id);
const content = ref(templates[0].html);

const currentTemplate = computed(() => {
  return templates.find((item) => item.id === selectedTemplateId.value) || templates[0];
});

const currentToolbarPermissions = computed(() => {
  return permissionPresets.find((item) => item.id === permissionPresetId.value)?.permissions || {};
});

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

const contentStats = computed(() => {
  const html = content.value || "";
  const plainText = html
    .replace(/<pre[\s\S]*?<\/pre>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    characters: plainText.length,
    blocks: (html.match(/<(p|h1|h2|h3|blockquote|pre|ul|ol|table)\b/g) || []).length,
    images: (html.match(/<img\b/g) || []).length,
    links: (html.match(/<a\b/g) || []).length,
  };
});

function applySelectedTemplate() {
  content.value = currentTemplate.value.html;
}

function clearContent() {
  editorRef.value?.clear();
}

function mockUploadImage(file, context = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Only image files are allowed."));
      return;
    }

    let progress = 0;
    const timer = window.setInterval(() => {
      progress += 12;
      context.onProgress?.(Math.min(progress, 96));

      if (progress < 96) {
        return;
      }

      window.clearInterval(timer);

      if (simulateUploadFailure.value) {
        reject(new Error("Simulated upload failure. Turn off the toggle and retry."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        context.onProgress?.(100);
        resolve(reader.result);
      };
      reader.onerror = () => reject(new Error("Image read failed."));
      reader.readAsDataURL(file);
    }, 120);
  });
}

function onUploadError(error) {
  console.error("image upload error", error);
}
</script>
