import { Authority } from "@/security/authority";

const Subscribers = () =>
	import("@/subscribers/presentation/views/SubscriberPage.vue");

export default [
	{
		path: "/audience/subscribers",
		name: "Subscribers",
		component: Subscribers,
		meta: { authorities: [Authority.USER] },
	},
];
