export type Language = {
	name: string;
};

export type Languages = Record<string, Language>;

const LANGUAGES: Readonly<Languages> = Object.freeze({
	en: { name: "English" },
	es: { name: "Spanish" },
});

const languages = (): Languages => LANGUAGES;

export default languages;
