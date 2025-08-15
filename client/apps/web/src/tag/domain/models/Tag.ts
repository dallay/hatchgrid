import { TagColors } from "./TagColors.ts";
import type { TagResponse } from "./TagResponse.ts";

export class Tag {
	id: string;
	name: string;
	color: TagColors;
	subscribers: ReadonlyArray<string> | string;
	createdAt?: Date | string;
	updatedAt?: Date | string;

	constructor(
		id: string,
		name: string,
		color: TagColors,
		subscribers: ReadonlyArray<string> | string,
		createdAt?: Date | string,
		updatedAt?: Date | string,
	) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.subscribers = subscribers;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	static fromResponse(response: TagResponse): Tag {
		return new Tag(
			response.id,
			response.name,
			response.color as TagColors,
			response.subscribers,
			response.createdAt,
			response.updatedAt,
		);
	}

	get colorClass(): string {
		const colorClassMap: Record<TagColors, string> = {
			[TagColors.Red]: "bg-red-500",
			[TagColors.Green]: "bg-green-500",
			[TagColors.Blue]: "bg-blue-500",
			[TagColors.Yellow]: "bg-yellow-500",
			[TagColors.Purple]: "bg-purple-500",
			[TagColors.Gray]: "bg-gray-500",
		};
		return colorClassMap[this.color] || "bg-gray-500";
	}

	get subscriberCount(): number {
		if (typeof this.subscribers === "string") {
			const count = Number.parseInt(this.subscribers, 10);
			return Number.isNaN(count) ? 0 : count; // Return 0 for invalid strings
		}
		return this.subscribers.length;
	}
}
