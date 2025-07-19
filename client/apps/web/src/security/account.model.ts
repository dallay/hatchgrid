/**
 * Represents a user account with authentication and profile information.
 *
 * @property username - The unique username of the account.
 * @property email - The email address associated with the account (optional).
 * @property fullname - The full name of the user (optional, can be null).
 * @property firstname - The first name of the user (optional, can be null).
 * @property lastname - The last name of the user (optional, can be null).
 * @property authorities - A readonly set of authority strings assigned to the account.
 * @property langKey - The language key for localization (optional).
 * @property activated - Indicates whether the account is activated (optional).
 * @property imageUrl - The URL of the user's profile image (optional).
 * @property createdDate - The date the account was created (optional).
 * @property lastModifiedDate - The date the account was last modified (optional).
 */
export interface Account {
	username: string;
	email?: string;
	fullname?: string | null;
	firstname?: string | null;
	lastname?: string | null;
	authorities: ReadonlySet<string>;
	langKey?: string;
	activated?: boolean;
	imageUrl?: string;
	createdDate?: Date | string;
	lastModifiedDate?: Date | string;
}
