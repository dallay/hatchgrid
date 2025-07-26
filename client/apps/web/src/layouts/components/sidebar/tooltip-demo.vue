<script setup lang="ts">
/**
 * Tooltip Integration Demo
 *
 * This component demonstrates the tooltip functionality for the dynamic sidebar navigation.
 * It shows how tooltips are displayed when the sidebar is collapsed and how they fall back
 * to item titles when no custom tooltip is provided.
 */
import { Bot, Settings2, Users } from "lucide-vue-next";
import { ref } from "vue";
import AppSidebarItem from "./AppSidebarItem.vue";
import type { AppSidebarItem as AppSidebarItemType } from "./types";

// Demo navigation items with various tooltip configurations
const demoItems = ref<AppSidebarItemType[]>([
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Bot,
		tooltip: "Navigate to main dashboard", // Custom tooltip text
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings2,
		// No tooltip property - will fall back to title
	},
	{
		title: "Admin Panel",
		icon: Users,
		tooltip: "Administration tools and settings", // Custom tooltip for parent item
		items: [
			{
				title: "User Management",
				url: "/admin/users",
				tooltip: "Manage system users",
			},
			{
				title: "System Settings",
				url: "/admin/settings",
				// No tooltip - will use title as fallback
			},
		],
	},
]);
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-lg font-semibold">Tooltip Integration Demo</h2>

    <div class="space-y-2">
      <h3 class="text-md font-medium">Navigation Items with Tooltip Support:</h3>

      <div class="border rounded-lg p-4">
        <ul class="space-y-2">
          <AppSidebarItem
            v-for="(item, index) in demoItems"
            :key="`demo-${index}`"
            :item="item"
            :level="0"
          />
        </ul>
      </div>
    </div>

    <div class="text-sm text-gray-600 space-y-2">
      <h4 class="font-medium">Tooltip Behavior:</h4>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>Custom Tooltip:</strong> "Dashboard" shows "Navigate to main dashboard"</li>
        <li><strong>Fallback to Title:</strong> "Settings" shows "Settings" as tooltip</li>
        <li><strong>Nested Items:</strong> Admin Panel and its children support tooltips</li>
        <li><strong>Collapsed State:</strong> Tooltips only appear when sidebar is collapsed</li>
        <li><strong>Mobile Friendly:</strong> Tooltips are hidden on mobile devices</li>
      </ul>
    </div>
  </div>
</template>
