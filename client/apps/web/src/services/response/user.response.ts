export interface UserResponse {
	readonly username: string;
	readonly email: string;
	readonly firstname?: string | null;
	readonly lastname?: string | null;
	readonly authorities: ReadonlySet<string>;
}
