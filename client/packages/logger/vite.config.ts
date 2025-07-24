import { resolve } from "node:path";
import { sharedViteConfig } from "@hatchgrid/config/vite.config.shared";
import { defineConfig, mergeConfig } from "vite";
import dts from "vite-plugin-dts";

/** @type {import('vite').UserConfig} */
export default defineConfig(
	mergeConfig(sharedViteConfig(__dirname), {
		test: {
			include: ["tests/**/*.test.ts"],
		},
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src"),
			},
		},
		build: {
			lib: {
				entry: resolve(__dirname, "src/index.ts"),
				name: "HatchgridLogger",
				formats: ["es", "cjs"],
				fileName: (format) => `logger.${format === "es" ? "js" : "cjs"}`,
			},
			target: ["es2022", "node18"],
			rollupOptions: {
				external: [],
				output: [
					{
						format: "es",
						preserveModules: false,
						exports: "named",
						entryFileNames: "logger.js",
					},
					{
						format: "cjs",
						preserveModules: false,
						exports: "named",
						entryFileNames: "logger.cjs",
					},
				],
			},
			minify: process.env.NODE_ENV === "production",
			sourcemap: true,
		},
		plugins: [
			dts({
				tsconfigPath: "./tsconfig.build.json",
				insertTypesEntry: true,
				rollupTypes: true,
			}),
		],
	}),
);
