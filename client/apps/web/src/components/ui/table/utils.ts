import type { Updater } from "@tanstack/vue-table";
import type { Ref } from "vue";

export function valueUpdater<T extends Updater<unknown>>(
	updaterOrValue: T,
	ref: Ref,
) {
	ref.value =
		typeof updaterOrValue === "function"
			? updaterOrValue(ref.value)
			: updaterOrValue;
}
