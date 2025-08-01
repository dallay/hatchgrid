/// <reference types="vite/client" />

declare module "~icons/*" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent<
		Record<string, unknown>,
		Record<string, unknown>,
		unknown
	>;
	export default component;
}
