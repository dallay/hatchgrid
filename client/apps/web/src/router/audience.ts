import { Authority } from "@/authentication/domain/models";

const Subscribers = () =>
	import("@/subscribers/infrastructure/views/views/SubscriberPage.vue");

export default [
	{
		path: "/audience/subscribers",
		name: "Subscribers",
		component: Subscribers,
		meta: { authorities: [Authority.USER] },
	},
];
