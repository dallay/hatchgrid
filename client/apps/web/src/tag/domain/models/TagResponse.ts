export interface TagResponse {
	id: string; // UUID v4
	name: string;
	color: string;
	subscribers: ReadonlyArray<string> | string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateTagRequest {
	name: string;
	color: string;
}

export interface UpdateTagRequest {
	name?: string;
	color?: string;
}
