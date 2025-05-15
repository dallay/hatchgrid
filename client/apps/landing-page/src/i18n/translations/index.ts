import type { UIDict } from "../types";

export const index: {
	en: UIDict;
	es: UIDict;
} = {
	en: {
		intro:
			"i18n Starter is a simple Astro theme for creating multilingual websites. It supports i18n feature from Astro v4.0.",
		"url.description":
			"Basically, only the subdirectory URL scheme is supported. It is managed by the URL as follows for each language. The root URL is redirected to the specified default language.",
		feature: "Feature",
		"feature.astro.i18n": "support for Astro's official i18n feature",
		"feature.multilingual": "Various management methods for multilingual pages",
		"feature.seo": "SEO friendly",
		"feature.performance": "100/100 Lighthouse performance",
		"getting.started": "Getting Started",
		"getting.started.description": "Assumes basic knowledge of Astro.",
		"getting.started.cta": "If you're okay, let's get started!",
		"start.setup": "Start Setup",
	},
	es: {
		intro:
			"i18n Starter es un tema Astro simple para crear sitios web multilingües. Admite la función i18n de Astro v4.0.",
		"url.description":
			"Básicamente, solo se admite el esquema de URL de subdirectorio. Se administra mediante la URL de la siguiente manera para cada idioma. La URL raíz se redirige al idioma predeterminado especificado.",
		feature: "Característica",
		"feature.astro.i18n": "soporte para la función i18n oficial de Astro",
		"feature.multilingual":
			"Varios métodos de gestión para páginas multilingües",
		"feature.seo": "SEO amigable",
		"feature.performance": "100/100 Lighthouse rendimiento",
		"getting.started": "Empezando",
		"getting.started.description": "Supone conocimientos básicos de Astro.",
		"getting.started.cta": "Si estás bien, ¡empecemos!",
		"start.setup": "Comenzar la configuración",
	},
};
