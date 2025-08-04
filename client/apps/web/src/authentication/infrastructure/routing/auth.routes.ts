import { Authority } from "@/authentication/domain/models";

const Register = () =>
	import("@/authentication/infrastructure/views/register/register.vue");
const Login = () =>
	import("@/authentication/infrastructure/views/login/login.vue");
const Activate = () =>
	import("@/authentication/infrastructure/views/activate/activate.vue");
const ResetPasswordInit = () =>
	import(
		"@/authentication/infrastructure/views/reset-password/init/reset-password-init.vue"
	);
const ResetPasswordFinish = () =>
	import(
		"@/authentication/infrastructure/views/reset-password/finish/reset-password-finish.vue"
	);
const ChangePassword = () =>
	import(
		"@/authentication/infrastructure/views/change-password/change-password.vue"
	);
const Settings = () =>
	import("@/authentication/infrastructure/views/settings/settings.vue");

export default [
	{
		path: "/login",
		name: "Login",
		component: Login,
		meta: { layout: "SimpleLayout" },
	},
	{
		path: "/register",
		name: "Register",
		component: Register,
		meta: { layout: "SimpleLayout" },
	},
	{
		path: "/account/activate",
		name: "Activate",
		component: Activate,
		meta: { layout: "SimpleLayout" },
	},
	{
		path: "/account/reset/request",
		name: "ResetPasswordInit",
		component: ResetPasswordInit,
		meta: { layout: "SimpleLayout" },
	},
	{
		path: "/account/reset/finish",
		name: "ResetPasswordFinish",
		component: ResetPasswordFinish,
		meta: { layout: "SimpleLayout" },
	},
	{
		path: "/account/password",
		name: "ChangePassword",
		component: ChangePassword,
		meta: { authorities: [Authority.USER] },
	},
	{
		path: "/account/settings",
		name: "Settings",
		component: Settings,
		meta: { authorities: [Authority.USER] },
	},
];
