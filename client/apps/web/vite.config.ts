import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isTLS = env.SPRING_PROFILES_ACTIVE?.includes("tls");

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      I18N_HASH: '"generated_hash"',
      SERVER_API_URL: '"/"',
      APP_VERSION: `"${process.env.APP_VERSION ? process.env.APP_VERSION : "DEV"}"`,
    },
    server: {
      host: true,
      port: 9876,
      proxy: Object.fromEntries(
        ["/api", "/management", "/v3/api-docs", "/h2-console"].map((res) => [
          res,
          {
            target: isTLS ? "https://localhost:8443" : "http://localhost:8080",
            secure: false,
            changeOrigin: true,
          },
        ]),
      ),
    },
  };
});
