import type { Account } from "./Account";

/**
 * Type guard to check if an object is a valid Account
 */
export function isAccount(obj: unknown): obj is Account {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"username" in obj &&
		typeof (obj as Record<string, unknown>).username === "string" &&
		"authorities" in obj &&
		(obj as Record<string, unknown>).authorities instanceof Set
	);
}

/**
 * Type guard to check if an account is activated
 */
export function isActivatedAccount(account: Account): boolean {
	return account.activated === true;
}

/**
 * Type guard to check if an account has a specific authority
 */
export function hasAuthority(account: Account, authority: string): boolean {
	return account.authorities.has(authority);
}

/**
 * Type guard to check if an account has any of the specified authorities
 */
export function hasAnyAuthority(
	account: Account,
	authorities: string[],
): boolean {
	return authorities.some((authority) => account.authorities.has(authority));
}

/**
 * Type guard to check if an account has all of the specified authorities
 */
export function hasAllAuthorities(
	account: Account,
	authorities: string[],
): boolean {
	return authorities.every((authority) => account.authorities.has(authority));
}
