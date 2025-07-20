import type { IntlNumberFormats } from "vue-i18n";

export const numberFormats: IntlNumberFormats = {
	en: {
		currency: {
			style: "currency",
			currency: "USD",
			notation: "standard",
		},
		decimal: {
			style: "decimal",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		},
		percent: {
			style: "percent",
			useGrouping: true,
		},
	},
	es: {
		currency: {
			style: "currency",
			currency: "EUR",
			notation: "standard",
		},
		decimal: {
			style: "decimal",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		},
		percent: {
			style: "percent",
			useGrouping: true,
		},
	},
};
