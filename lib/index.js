import VueEditor from "../src/components/VueEditor.vue";

export { VueEditor };

export default {
  install(app) {
    app.component("VueEditor", VueEditor);
  },
};
