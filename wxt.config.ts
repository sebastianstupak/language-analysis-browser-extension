import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    description: "Analyzes and highlights text based on language difficulty",
    permissions: ["activeTab", "storage"],
    host_permissions: ["<all_urls>"],
    background: {
      service_worker: 'entrypoints/background.ts',
    },
  },
  vite: () => ({
    build: {
      rollupOptions: {
        input: {
          "english-word-rankings": "assets/word-ranking/en.json",
        },
      },
    },
  }),
});