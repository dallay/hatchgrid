import type { Lang } from "@/i18n";

/**
 * Interface for FAQ filtering criteria
 */
export interface FaqCriteria {
	lang?: Lang;
	question?: string;
	answer?: string;
}
