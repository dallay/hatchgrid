import { resolve } from "node:path";
import { sharedViteConfig } from "@hatchgrid/config/vite.config.shared";
import { defineConfig, mergeConfig } from "vite";
import dts from "vite-plugin-dts";

/** @type {import('vite').UserConfig} */
export default defineConfig(
	mergeConfig(sharedViteConfig(__dirname), {
		build: {
			lib: {
				entry: resolve(__dirname, "src/index.ts"),
				name: "logger",
				formats: ["es"],
				// The filename is inferred from package.json (main/module)
				// so we don't need `fileName` here.
			},
			target: "esnext",
		},
		plugins: [
			// Add the plugin and point it to the build tsconfig
			dts({
				tsconfigPath: "./tsconfig.build.json",
			}),
		],
	}),
);
