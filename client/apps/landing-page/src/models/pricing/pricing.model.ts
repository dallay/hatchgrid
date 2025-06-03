/**
 * Represents a pricing plan entity in the system.
 * @interface PricingPlan
 * @property {string} id - The unique identifier of the pricing plan
 * @property {string} title - The title/name of the pricing plan
 * @property {string} description - The description of the pricing plan
 * @property {number} price - The price of the plan
 * @property {"month" | "year"} interval - The billing interval
 * @property {Feature[]} features - The features included in the plan
 * @property {boolean} highlighted - Whether this plan should be highlighted
 * @property {number} order - The display order of the plan
 *
 * @example
 * // English pricing plan
 * const englishPlan: PricingPlan = {
 *   id: "en/starter",
 *   title: "Starter",
 *   description: "Best option for personal use & for your next project.",
 *   price: 29,
 *   interval: "month",
 *   features: [
 *     { text: "Individual configuration" },
 *     { text: "Team size", value: "1 developer" }
 *   ],
 *   highlighted: false,
 *   order: 0
 * };
 *
 * // Spanish pricing plan
 * const spanishPlan: PricingPlan = {
 *   id: "es/starter",
 *   title: "Inicial",
 *   description: "Mejor opción para uso personal y tu próximo proyecto.",
 *   price: 29,
 *   interval: "month",
 *   features: [
 *     { text: "Configuración individual" },
 *     { text: "Tamaño del equipo", value: "1 desarrollador" }
 *   ],
 *   highlighted: false,
 *   order: 0
 * };
 */

/**
 * Represents a feature in a pricing plan
 * @interface Feature
 * @property {string} text - The feature description
 * @property {string} [value] - Optional value or specification for the feature
 */
export interface Feature {
	text: string;
	value?: string;
}

export default interface PricingPlan {
	id: string;
	title: string;
	description: string;
	price: number;
	interval: "month" | "year";
	features: Feature[];
	highlighted: boolean;
	order: number;
	draft?: boolean;
}
