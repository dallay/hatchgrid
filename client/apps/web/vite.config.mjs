import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { sharedViteConfig } from "../config/vite.config.shared.mjs";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import IconsResolver from "unplugin-icons/resolver";

// https://vitejs.dev/config/
export default defineConfig({
  ...sharedViteConfig(new URL(".", import.meta.url).pathname),
  plugins: [
    vue(),
    Icons({ compiler: "vue3" }),
    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
      deep: true,
      dtypes: true,
      resolvers: [IconsResolver({ prefix: "icon" })],
    }),
  ],
});
