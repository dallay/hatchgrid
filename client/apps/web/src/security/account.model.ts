export interface Account {
	login: string;
	username: string;
	email?: string;
	fullname?: string | null; // firstname + lastname
	firstname?: string | null;
	lastname?: string | null;
	authorities: ReadonlySet<string>;
	langKey?: string;
	activated?: boolean;
	imageUrl?: string;
	createdDate?: string;
	lastModifiedDate?: string;
}
