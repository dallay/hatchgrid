import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			globals: true,
			environment: "jsdom",
			include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
			setupFiles: ["./vitest.setup.ts"],
			coverage: {
				provider: "v8",
				reporter: ["text", "lcov"],
				reportsDirectory: "./coverage",
				include: ["src/**/*.{js,ts,vue,jsx,tsx}"],
				exclude: [
					"src/env.d.ts",
					"src/consts.ts",
					"src/content.config.ts",
					"src/pages/robots.txt.ts",
					"src/**/__tests__/**",
					"src/**/*.spec.{js,ts,vue,jsx,tsx}", // Added to exclude all spec files
					"src/i18n/**",
				],
			},
		},
		resolve: {
			alias: {
				vue: "vue",
				"@": resolve(__dirname, "./src"),
				"@i18n": resolve(__dirname, "./src/i18n/index.ts"),
				"@lib": resolve(__dirname, "./src/lib"),
				"@models": resolve(__dirname, "./src/lib/models"),
				"@components": resolve(__dirname, "./src/components"),
			},
		},
	}),
);
