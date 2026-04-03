import path from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.js"),
      name: "VueEditorProseKit",
      formats: ["es", "umd"],
      fileName: (format) =>
        format === "es"
          ? "vue-editor-prose-kit.js"
          : "vue-editor-prose-kit.umd.cjs",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        exports: "named",
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
