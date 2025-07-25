import { Authority } from "@/security/authority";

const Subscribers = () => import("@/audience/subscriber/Subscribers.vue");

export default [
	{
		path: "/audience/subscribers",
		name: "Subscribers",
		component: Subscribers,
		meta: { authorities: [Authority.USER] },
	},
];
