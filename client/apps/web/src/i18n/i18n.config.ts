import { createI18nInstance } from "./config";

// This file is kept for backward compatibility
// New code should import from './config' directly

export default function initI18N() {
	return createI18nInstance();
}
