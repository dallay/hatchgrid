export interface Account {
	login: string;
	authorities: string[];
	email?: string;
	firstName?: string;
	lastName?: string;
	langKey?: string;
	activated?: boolean;
	imageUrl?: string;
	createdDate?: string;
	lastModifiedDate?: string;
	name?: string;
	avatar?: string;
}
