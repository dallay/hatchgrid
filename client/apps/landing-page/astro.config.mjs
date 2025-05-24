import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { BASE_URL } from "./src/consts.ts";
import { DEFAULT_LOCALE_SETTING, LOCALES_SETTING } from "./src/i18n/locales";

import tailwindcss from "@tailwindcss/vite";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
	// Set your site's URL
	site: "https://hatchgrid.pages.dev",

	i18n: {
		defaultLocale: DEFAULT_LOCALE_SETTING,
		locales: Object.keys(LOCALES_SETTING),
		routing: {
			prefixDefaultLocale: true,
			redirectToDefaultLocale: false,
		},
	},

	integrations: [
		mdx(),
		sitemap({
			filter: (page) => page !== `${BASE_URL}/admin/`,
			i18n: {
				defaultLocale: DEFAULT_LOCALE_SETTING,
				locales: Object.fromEntries(
					Object.entries(LOCALES_SETTING).map(([key, value]) => [
						key,
						value.lang ?? key,
					]),
				),
			},
		}),
		icon({
			iconDir: "src/assets/icons",
			include: {
				tabler: ["*"],
				openmoji: ["*"],
			},
		}),
		vue(),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
