import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [vue()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		include: [
			"**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
			"**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
		],
		exclude: ["**/node_modules/**", "**/components.d.ts", "**/tests/e2e/**"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@i18n": resolve(__dirname, "./src/i18n/index.ts"),
			"@lib": resolve(__dirname, "./src/lib"),
			"@models": resolve(__dirname, "./src/lib/models"),
			"@components": resolve(__dirname, "./src/components"),
		},
	},
});
