import { computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

export default defineComponent({
	compatConfig: { MODE: 3 },
	name: "Ribbon",
	setup() {
		const store = useAuthStore();
		const ribbonEnv = computed(() => store.ribbonOnProfiles);
	const ribbonEnabled = computed(
		() =>
			store.ribbonOnProfiles &&
			store.activeProfiles.includes(store.ribbonOnProfiles),
	);

		return {
			ribbonEnv,
			ribbonEnabled,
			t$: useI18n().t,
		};
	},
});
