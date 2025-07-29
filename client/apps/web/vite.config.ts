import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		vue(),
		tailwindcss(),
		Components({
			dts: true,
			resolvers: [
				IconsResolver({
					prefix: "",
					enabledCollections: ["ph"],
				}),
			],
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
		proxy: {
			"/api": {
				target: "http://localhost:8080",
				secure: false,
				changeOrigin: true,
			},
			"/actuator": {
				target: "http://localhost:8080",
				secure: false,
				changeOrigin: true,
			},
			"/v3/api-docs": {
				target: "http://localhost:8080",
				secure: false,
				changeOrigin: true,
			},
			"/h2-console": {
				target: "http://localhost:8080",
				secure: false,
				changeOrigin: true,
			},
		},
	},
});
