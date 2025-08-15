import { Authority } from "@/authentication";

const Tags = () => import("@/tag/infrastructure/views/views/TagPage.vue");
export default [
	{
		path: "/audience/tags",
		name: "Tags",
		component: Tags,
		meta: { authorities: [Authority.USER] },
	},
];
