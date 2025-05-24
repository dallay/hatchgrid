import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
		setupFiles: ["./vitest.setup.ts"],
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
