import { type VariantProps, cva } from "class-variance-authority";

export { default as CTAEmail } from "./CTAEmail.vue";

export const ctaEmailVariants = cva(
	"flex flex-col items-center gap-4 sm:flex-row sm:gap-2",
	{
		variants: {
			size: {
				sm: "mb-6 gap-3 sm:gap-1.5",
				default: "mb-10 gap-4 sm:gap-2",
				lg: "mb-12 gap-6 sm:gap-3",
			},
			alignment: {
				left: "sm:justify-start",
				center: "sm:justify-center",
				right: "sm:justify-end",
			},
		},
		defaultVariants: {
			size: "default",
			alignment: "center",
		},
	},
);

export const ctaEmailInputVariants = cva(
	"w-full rounded-md border px-4 py-3 text-gray-900 shadow-sm transition-all focus:ring-2 focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
				primary: "border-primary/30 focus:border-primary focus:ring-primary/20",
				secondary: "border-gray-200 focus:border-gray-400 focus:ring-gray-300",
			},
			size: {
				sm: "px-3 py-2 text-sm",
				default: "px-4 py-3",
				lg: "px-5 py-4 text-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export const ctaEmailButtonVariants = cva(
	"w-full whitespace-nowrap rounded-md font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto",
	{
		variants: {
			variant: {
				default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
				primary:
					"bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20",
				secondary:
					"bg-white text-blue-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:ring-gray-300",
				outline:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring/20",
			},
			size: {
				sm: "px-6 py-2 text-sm",
				default: "px-8 py-3 text-base",
				lg: "px-10 py-4 text-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export type CTAEmailVariants = VariantProps<typeof ctaEmailVariants>;
export type CTAEmailInputVariants = VariantProps<typeof ctaEmailInputVariants>;
export type CTAEmailButtonVariants = VariantProps<
	typeof ctaEmailButtonVariants
>;
