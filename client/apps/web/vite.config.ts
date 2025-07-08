import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	const isTLS = env.SPRING_PROFILES_ACTIVE?.includes("tls");

	return {
		plugins: [
			vue(),
			tailwindcss(),
			Components({
				dts: true,
				resolvers: [IconsResolver({ prefix: "" })],
			}),
			Icons({
				autoInstall: true,
				compiler: "vue3",
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
				"~icons": "virtual:icons",
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
