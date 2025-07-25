/**
 * Test utilities for sidebar components
 * Provides reusable mocks and test helpers
 */

export const createSidebarMocks = () => ({
  SidebarMenuButton: {
    name: "SidebarMenuButton",
    props: ["tooltip", "isActive", "as", "href", "aria-expanded", "aria-label"],
    template: `
      <component
        :is="as || 'button'"
        v-bind="$attrs"
        :data-tooltip="tooltip"
        :data-active="isActive"
        :aria-label="$props['aria-label']"
        :aria-expanded="$props['aria-expanded']"
        :href="href"
      >
        <slot />
      </component>
    `,
  },
  SidebarMenuItem: {
    name: "SidebarMenuItem",
    template: "<li><slot /></li>",
  },
  SidebarMenuSub: {
    name: "SidebarMenuSub",
    template: "<ul><slot /></ul>",
  },
  SidebarMenuSubButton: {
    name: "SidebarMenuSubButton",
    props: ["isActive", "as", "href", "aria-expanded", "aria-label"],
    template: `
      <component
        :is="as || 'button'"
        v-bind="$attrs"
        :data-active="isActive"
        :aria-label="$props['aria-label']"
        :aria-expanded="$props['aria-expanded']"
        :href="href"
      >
        <slot />
      </component>
    `,
  },
  SidebarMenuSubItem: {
    name: "SidebarMenuSubItem",
    template: "<li><slot /></li>",
  },
});

export const createCollapsibleMocks = () => ({
  Collapsible: {
    name: "Collapsible",
    props: ["defaultOpen", "asChild"],
    template: `
      <div
        :data-state="defaultOpen ? 'open' : 'closed'"
        class="group/collapsible"
      >
        <slot />
      </div>
    `,
  },
  CollapsibleContent: {
    name: "CollapsibleContent",
    template: "<div><slot /></div>",
  },
  CollapsibleTrigger: {
    name: "CollapsibleTrigger",
    props: ["asChild"],
    template: "<div><slot /></div>",
  },
});

/**
 * Creates a test router with common routes
 */
export const createTestRouter = () => {
  const { createRouter, createWebHistory } = require("vue-router");

  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", component: { template: "<div>Home</div>" } },
      { path: "/dashboard", component: { template: "<div>Dashboard</div>" } },
      { path: "/settings", component: { template: "<div>Settings</div>" } },
      { path: "/admin/users", component: { template: "<div>Users</div>" } },
      { path: "/admin/users/add", component: { template: "<div>Add User</div>" } },
    ],
  });
};

/**
 * Factory for creating test sidebar items
 */
export const createTestSidebarItem = (overrides: Partial<any> = {}) => ({
  title: "Test Item",
  ...overrides,
});
