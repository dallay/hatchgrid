import { Authority } from "@/authentication/domain/models";

const useSubscribersV2 = import.meta.env.VITE_USE_SUBSCRIBERS_V2 === "true";

const Subscribers = () =>
	useSubscribersV2
		? import("@/subscribers/infrastructure/views/views/v2/SubscriberPage.vue")
		: import("@/subscribers/infrastructure/views/views/SubscriberPage.vue");
export default [
	{
		path: "/audience/subscribers",
		name: "Subscribers",
		component: Subscribers,
		meta: { authorities: [Authority.USER] },
	},
];
