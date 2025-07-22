import { describe, expect, it, vi } from "vitest";

vi.mock("@hatchgrid/utilities", () => ({
	deepmerge: {
		all: vi.fn((objs) => {
			const deepMerge = (
				target: Record<string, unknown>,
				source: Record<string, unknown>,
			): Record<string, unknown> => {
				const result: Record<string, unknown> = { ...target };
				for (const key in source) {
					if (source[key] instanceof Object && !Array.isArray(source[key])) {
						result[key] = deepMerge(
							(result[key] as Record<string, unknown>) || {},
							source[key] as Record<string, unknown>,
						);
					} else {
						result[key] = source[key];
					}
				}
				return result;
			};
			return objs.reduce(
				(acc: Record<string, unknown>, obj: Record<string, unknown>) =>
					deepMerge(acc, obj),
				{},
			);
		}),
	},
}));

import { getLocaleModules } from "./load.locales";

const enRegisterValidation = {
	"firstName-min": "First name must be at least 2 characters.",
	"lastName-min": "Last name must be at least 2 characters.",
	"email-invalid": "Please enter a valid email address.",
	"password-min": "Password must be at least 8 characters.",
	"password-uppercase": "Password must include at least one uppercase letter.",
	"password-lowercase": "Password must include at least one lowercase letter.",
	"password-number": "Password must include at least one number.",
	"password-special": "Password must include at least one special character.",
	"password-match": "Passwords do not match.",
};

const esRegisterValidation = {
	"firstName-min": "El nombre debe tener al menos 2 caracteres.",
	"lastName-min": "El apellido debe tener al menos 2 caracteres.",
	"email-invalid":
		"Por favor, introduce una dirección de correo electrónico válida.",
	"password-min": "La contraseña debe tener al menos 8 caracteres.",
	"password-uppercase":
		"La contraseña debe incluir al menos una letra mayúscula.",
	"password-lowercase":
		"La contraseña debe incluir al menos una letra minúscula.",
	"password-number": "La contraseña debe incluir al menos un número.",
	"password-special":
		"La contraseña debe incluir al menos un carácter especial.",
	"password-match": "Las contraseñas no coinciden.",
};

const enLoginForm = {
	username: "Username",
	"username-placeholder": "Enter your username",
	password: "Password",
	"password-placeholder": "Enter your password",
	rememberMe: "Remember Me",
	submit: "Login",
	forgotPassword: "Forgot Password?",
	loading: "Logging in...",
	register: "Don't have an account?",
	"register-link": "Sign up",
	validation: {
		"username-required": "Username is required",
		"password-required": "Password is required",
	},
};

const esLoginForm = {
	username: "Usuario",
	"username-placeholder": "Ingrese su usuario",
	password: "Contraseña",
	"password-placeholder": "Ingrese su contraseña",
	rememberMe: "Recuérdame",
	submit: "Iniciar sesión",
	forgotPassword: "¿Olvidó su contraseña?",
	loading: "Iniciando sesión...",
	register: "¿No tienes una cuenta?",
	"register-link": "Regístrate",
	validation: {
		"username-required": "El usuario es obligatorio",
		"password-required": "La contraseña es obligatoria",
	},
};

const mockMessages = {
	"./locales/en/global.json": {
		default: { global: { ribbon: { dev: "Development" } } },
	},
	"./locales/en/error.json": {
		default: {
			error: {
				title: "Error Occurred",
				message: "An unexpected error has occurred. Please try again later.",
				backToHome: "Back to Home",
			},
		},
	},
	"./locales/en/login.json": {
		default: {
			login: {
				title: "Login",
				description: "Enter your credentials below to login to your account.",
				form: enLoginForm,
			},
		},
	},
	"./locales/en/register.json": {
		default: { register: { form: { validation: enRegisterValidation } } },
	},
	"./locales/es/global.json": {
		default: { global: { ribbon: { dev: "Desarrollo" } } },
	},
	"./locales/es/error.json": {
		default: {
			error: {
				title: "Ocurrió un error",
				message:
					"Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.",
				backToHome: "Volver al inicio",
			},
		},
	},
	"./locales/es/login.json": {
		default: {
			login: {
				title: "Iniciar sesión",
				description: "Ingrese sus credenciales abajo para acceder a su cuenta.",
				form: esLoginForm,
			},
		},
	},
	"./locales/es/register.json": {
		default: { register: { form: { validation: esRegisterValidation } } },
	},
};

vi.stubGlobal("import.meta", {
	glob: vi.fn((pattern: string, options: { eager: boolean }) => {
		if (pattern === "./locales/**/*.json" && options.eager) {
			return mockMessages;
		}
		return {};
	}),
});

const expectedEnMessages = {
	global: { ribbon: { dev: "Development" } },
	error: {
		title: "Error Occurred",
		message: "An unexpected error has occurred. Please try again later.",
		backToHome: "Back to Home",
	},
	login: {
		title: "Login",
		description: "Enter your credentials below to login to your account.",
		form: enLoginForm,
	},
	register: { form: { validation: enRegisterValidation } },
};

const expectedEsMessages = {
	global: { ribbon: { dev: "Desarrollo" } },
	error: {
		title: "Ocurrió un error",
		message:
			"Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.",
		backToHome: "Volver al inicio",
	},
	login: {
		title: "Iniciar sesión",
		description: "Ingrese sus credenciales abajo para acceder a su cuenta.",
		form: esLoginForm,
	},
	register: { form: { validation: esRegisterValidation } },
};

describe("getLocaleModules", () => {
	it("returns merged messages for en locale", () => {
		const result = getLocaleModules("en");
		console.log("Test en result:", result);
		expect(result).toEqual(expectedEnMessages);
	});

	it("returns merged messages for es locale", () => {
		const result = getLocaleModules("es");
		console.log("Test es result:", result);
		expect(result).toEqual(expectedEsMessages);
	});

	it("returns empty object for unsupported locale", () => {
		const result = getLocaleModules("fr");
		expect(result).toEqual({});
	});

	it("caches merged locale messages to avoid redundant merging", () => {
		const firstCall = getLocaleModules("en");
		const secondCall = getLocaleModules("en");
		expect(secondCall).toBe(firstCall);
	});
});
