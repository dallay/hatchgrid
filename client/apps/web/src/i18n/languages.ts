export type Language = {
	name: string;
};

export type Languages = Record<string, Language>;

const languages = (): Languages => ({
	en: { name: "English" },
	es: { name: "Spanish" },
});

export default languages;
