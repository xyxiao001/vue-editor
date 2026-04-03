import DefaultTheme from "vitepress/theme";
import VueEditor from "../../../src/components/VueEditor.vue";
import EditorPlayground from "../components/EditorPlayground.vue";
import "../styles/custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx);
    ctx.app.component("VueEditor", VueEditor);
    ctx.app.component("EditorPlayground", EditorPlayground);
  },
};
