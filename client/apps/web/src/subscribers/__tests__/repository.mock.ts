// Mock repository for testing

import { vi } from "vitest";
import {
	type SubscriberRepository,
	SubscriberStatus,
} from "@/subscribers/domain";

export const repositoryMock = (): SubscriberRepository => ({
	fetchAll: vi.fn().mockResolvedValue([
		{
			id: "1",
			email: "user1@example.com",
			name: "User One",
			status: SubscriberStatus.ENABLED,
			workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		},
		{
			id: "2",
			email: "user2@example.com",
			name: "User Two",
			status: SubscriberStatus.DISABLED,
			workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			createdAt: "2024-01-02T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		},
	]),
	countByStatus: vi.fn().mockResolvedValue([
		{ status: SubscriberStatus.ENABLED, count: 1 },
		{ status: SubscriberStatus.DISABLED, count: 1 },
		{ status: SubscriberStatus.BLOCKLISTED, count: 0 },
	]),
	countByTags: vi.fn().mockResolvedValue([
		{ tag: "premium", count: 5 },
		{ tag: "newsletter", count: 3 },
		{ tag: "beta", count: 1 },
	]),
});
