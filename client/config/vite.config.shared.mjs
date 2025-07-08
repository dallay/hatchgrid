/** @type {import("vite").UserConfig} */
import { resolve } from "node:path";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";

export const sharedViteConfig = (dirname) => ({
	resolve: {
		alias: {
			"~": resolve(dirname, "src"),
			"@": resolve(dirname, "src"),
		},
		mainFields: ["module"],
	},
	plugins: [
		codecovVitePlugin({
			enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
			bundleName: "HatchgridUI",
			uploadToken: process.env.CODECOV_TOKEN,
		}),
		Icons({ compiler: "vue3" }),
		Components({
			dirs: ["src/components"],
			extensions: ["vue"],
			deep: true,
			dtypes: true,
		}),
	],
	test: {
		globals: true,
		environment: "happy-dom",
		alias: {
			"@/": resolve(dirname, "src/"),
		},
	},
});
