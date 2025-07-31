import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import WorkspaceSelectorSkeleton from "../WorkspaceSelectorSkeleton.vue";

// Mock the sidebar composable
vi.mock("@/components/ui/sidebar", () => ({
	SidebarMenu: { template: "<div><slot /></div>" },
	SidebarMenuItem: { template: "<div><slot /></div>" },
	SidebarMenuButton: { template: "<button><slot /></button>" },
	useSidebar: () => ({ isMobile: false }),
}));

// Mock other UI components
vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: { template: "<div><slot /></div>" },
	DropdownMenuContent: { template: "<div><slot /></div>" },
	DropdownMenuLabel: { template: "<div><slot /></div>" },
	DropdownMenuTrigger: { template: "<div><slot /></div>" },
}));

vi.mock("@/components/ui/skeleton", () => ({
	Skeleton: { template: '<div class="skeleton" />' },
}));

describe("WorkspaceSelectorSkeleton", () => {
	it("renders with default skeleton count", () => {
		const wrapper = mount(WorkspaceSelectorSkeleton);

		// Should render 3 skeleton items by default (looking for the specific workspace items)
		const skeletonItems = wrapper.findAll('[aria-label^="Loading workspace "]');
		expect(skeletonItems).toHaveLength(3);
	});

	it("renders with custom skeleton count", () => {
		const wrapper = mount(WorkspaceSelectorSkeleton, {
			props: { skeletonCount: 5 },
		});

		// Should render 5 skeleton items
		const skeletonItems = wrapper.findAll('[aria-label^="Loading workspace "]');
		expect(skeletonItems).toHaveLength(5);
	});

	it("has proper accessibility attributes", () => {
		const wrapper = mount(WorkspaceSelectorSkeleton);

		// Should have role="status" for loading state
		const loadingContainer = wrapper.find('[role="status"]');
		expect(loadingContainer.exists()).toBe(true);
		expect(loadingContainer.attributes("aria-label")).toBe(
			"Loading workspaces",
		);
	});

	it("renders building icon and chevron", () => {
		const wrapper = mount(WorkspaceSelectorSkeleton);

		// Should contain the building icon and chevron (rendered as SVG elements)
		expect(wrapper.html()).toContain("lucide-building-2");
		expect(wrapper.html()).toContain("lucide-chevrons-up-down");
	});
});
