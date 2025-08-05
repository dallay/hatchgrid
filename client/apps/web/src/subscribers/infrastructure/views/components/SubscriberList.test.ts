// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import type { Subscriber } from "../../../domain/models";
import { SubscriberStatus } from "../../../domain/models";
import SubscriberList from "./SubscriberList.vue";

// Mock lucide-vue-next icons
vi.mock("lucide-vue-next", () => ({
	MoreHorizontal: {
		template: '<div data-testid="more-horizontal-icon"></div>',
	},
	Mail: { template: '<div data-testid="mail-icon"></div>' },
	User: { template: '<div data-testid="user-icon"></div>' },
}));

// Mock UI components
vi.mock("@/components/ui/badge", () => ({
	Badge: { template: '<span data-testid="badge"><slot /></span>' },
}));

vi.mock("@/components/ui/button", () => ({
	Button: { template: '<button data-testid="button"><slot /></button>' },
}));

vi.mock("@/components/ui/table", () => ({
	Table: { template: '<table data-testid="table"><slot /></table>' },
	TableBody: { template: '<tbody data-testid="table-body"><slot /></tbody>' },
	TableCell: { template: '<td data-testid="table-cell"><slot /></td>' },
	TableEmpty: {
		template: '<tr data-testid="table-empty"><td><slot /></td></tr>',
	},
	TableHead: { template: '<th data-testid="table-head"><slot /></th>' },
	TableHeader: {
		template: '<thead data-testid="table-header"><slot /></thead>',
	},
	TableRow: { template: '<tr data-testid="table-row"><slot /></tr>' },
}));

vi.mock("@/components/ui/avatar", () => ({
	Avatar: { template: '<div data-testid="avatar"><slot /></div>' },
	AvatarFallback: {
		template: '<div data-testid="avatar-fallback"><slot /></div>',
	},
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: { template: '<div data-testid="dropdown-menu"><slot /></div>' },
	DropdownMenuContent: {
		template: '<div data-testid="dropdown-menu-content"><slot /></div>',
	},
	DropdownMenuItem: {
		template:
			'<div data-testid="dropdown-menu-item" @click="$emit(\'click\')"><slot /></div>',
	},
	DropdownMenuTrigger: {
		template: '<div data-testid="dropdown-menu-trigger"><slot /></div>',
	},
}));

describe("SubscriberList", () => {
	const mockSubscribers: Subscriber[] = [
		{
			id: "1",
			email: "john@example.com",
			name: "John Doe",
			status: SubscriberStatus.ENABLED,
			workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		},
		{
			id: "2",
			email: "jane@example.com",
			status: SubscriberStatus.DISABLED,
			workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			createdAt: "2024-01-02T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		},
		{
			id: "3",
			email: "blocked@example.com",
			name: "Blocked User",
			status: SubscriberStatus.BLOCKLISTED,
			workspaceId: "d2054881-b8c1-4bfa-93ce-a0e94d003ead",
			createdAt: "2024-01-03T00:00:00Z",
			updatedAt: "2024-01-03T00:00:00Z",
		},
	];

	it("renders subscribers table with data", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: mockSubscribers,
			},
		});

		expect(wrapper.find('[data-testid="subscribers-list"]').exists()).toBe(
			true,
		);
		expect(wrapper.findAll('[data-testid="subscriber-item"]')).toHaveLength(3); // 3 data items
	});

	it("displays subscriber information correctly", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [mockSubscribers[0]],
			},
		});

		const text = wrapper.text();
		expect(text).toContain("John Doe");
		expect(text).toContain("john@example.com");
	});

	it("shows loading state when loading prop is true", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [],
				loading: true,
			},
		});

		// Should show loading state
		expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true);
		expect(wrapper.text()).not.toContain("No subscribers");
	});

	it("shows empty state when no subscribers and not loading", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [],
				loading: false,
			},
		});

		expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
		expect(wrapper.text()).toContain("No subscribers yet");
		expect(wrapper.text()).toContain(
			"Get started by adding your first subscriber",
		);
	});

	it("shows error state when error prop is provided", () => {
		const errorMessage = "Failed to load subscribers";
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [],
				error: errorMessage,
			},
		});

		expect(wrapper.text()).toContain("Error loading subscribers");
		expect(wrapper.text()).toContain(errorMessage);
		expect(wrapper.find('[data-testid="table"]').exists()).toBe(false);
	});

	it("emits edit-subscriber event when edit is clicked", async () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [mockSubscribers[0]],
			},
		});

		// Find and click the edit button
		const editButton = wrapper.find('[data-testid="edit-button"]');
		await editButton.trigger("click");

		expect(wrapper.emitted("edit-subscriber")).toBeTruthy();
		expect(wrapper.emitted("edit-subscriber")?.[0]).toEqual([
			mockSubscribers[0],
		]);
	});

	it("emits toggle-status event when toggle status is clicked", async () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [mockSubscribers[0]],
			},
		});

		// Find and click the toggle status button
		const toggleButton = wrapper.find('[data-testid="toggle-status-button"]');
		await toggleButton.trigger("click");

		expect(wrapper.emitted("toggle-status")).toBeTruthy();
		expect(wrapper.emitted("toggle-status")?.[0]).toEqual([mockSubscribers[0]]);
	});

	it("emits delete-subscriber event when delete is clicked", async () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [mockSubscribers[0]],
			},
		});

		// Find and click the delete button
		const deleteButton = wrapper.find('[data-testid="delete-button"]');
		await deleteButton.trigger("click");

		expect(wrapper.emitted("delete-subscriber")).toBeTruthy();
		expect(wrapper.emitted("delete-subscriber")?.[0]).toEqual([
			mockSubscribers[0],
		]);
	});

	it("displays correct status badges for different subscriber statuses", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: mockSubscribers,
			},
		});

		const text = wrapper.text();
		expect(text).toContain("Active"); // ENABLED status
		expect(text).toContain("Disabled"); // DISABLED status
		expect(text).toContain("Blocked"); // BLOCKLISTED status
	});

	it("displays correct initials for subscribers", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [mockSubscribers[0]], // John Doe
			},
		});

		const avatarFallback = wrapper.find('[data-testid="avatar-fallback"]');
		expect(avatarFallback.text()).toBe("JD");
	});

	it("uses email as display name when name is not provided", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [mockSubscribers[1]], // jane@example.com (no name)
			},
		});

		const text = wrapper.text();
		expect(text).toContain("jane@example.com");

		// Check initials are based on email (initials function extracts from single word)
		const avatarFallback = wrapper.find('[data-testid="avatar-fallback"]');
		expect(avatarFallback.text()).toBe("J"); // First letter of email when no spaces
	});

	it("formats dates correctly", () => {
		const wrapper = mount(SubscriberList, {
			props: {
				subscribers: [mockSubscribers[0]],
			},
		});

		// Should contain formatted date (using formatDate utility)
		const text = wrapper.text();
		expect(text).toContain("Joined"); // Should show "Joined" text
		expect(text).toContain("2024"); // Should contain the year
	});

	it("shows correct action text based on subscriber status", () => {
		const enabledSubscriber = mockSubscribers[0]; // ENABLED
		const disabledSubscriber = mockSubscribers[2]; // DISABLED

		// Test enabled subscriber shows disable button with correct aria-label
		const wrapperEnabled = mount(SubscriberList, {
			props: {
				subscribers: [enabledSubscriber],
			},
		});
		const toggleButtonEnabled = wrapperEnabled.find(
			'[data-testid="toggle-status-button"]',
		);
		expect(toggleButtonEnabled.attributes("aria-label")).toContain("Disable");

		// Test disabled subscriber shows enable button with correct aria-label
		const wrapperDisabled = mount(SubscriberList, {
			props: {
				subscribers: [disabledSubscriber],
			},
		});
		const toggleButtonDisabled = wrapperDisabled.find(
			'[data-testid="toggle-status-button"]',
		);
		expect(toggleButtonDisabled.attributes("aria-label")).toContain("Enable");
	});
});
