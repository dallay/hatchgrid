export const DEFAULT_LOCALE = "en";

export const LOCALES = {
	en: {
		label: "English",
		lang: "en-US",
		flag: "openmoji:flag-united-states",
	},
	es: {
		label: "Español",
		flag: "openmoji:flag-spain",
	},
};

export const SHOW_DEFAULT_LANG_IN_URL = false;

export type Lang = keyof typeof LOCALES;

export type Dictionary = {
	[key: string]: string | Dictionary;
};

export type UIDict = {
	[key: string]: string;
};

export type UIMultilingual = {
	[lang in Lang]: UIDict;
};

export type Multilingual = {
	[lang in Lang]?: string;
};
