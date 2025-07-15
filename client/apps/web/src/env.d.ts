/// <reference types="vite/client" />

declare module "~icons/*" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent<{}, {}, unknown>;
	export default component;
}
