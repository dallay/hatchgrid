<script setup lang="ts">
/**
 * AppSidebarItem - Recursive sidebar navigation item component
 *
 * Renders individual navigation items with support for:
 * - Nested menu structures with unlimited depth
 * - Active state detection based on current route
 * - Collapsible submenus with auto-expansion for active items
 * - Icon support using Lucide Vue Next
 * - Tooltip integration for collapsed sidebar state
 * - Accessibility features (ARIA attributes)
 *
 * @component
 */
import { ChevronRight } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSafeItemProcessing } from "./composables/useErrorBoundary";
import type { AppSidebarItem } from "./types";
import { isItemActive } from "./utils";

interface Props {
	item: AppSidebarItem;
	level?: number;
}

const props = withDefaults(defineProps<Props>(), {
	level: 0,
});

const route = useRoute();

// Use safe item processing for error boundary and validation
const { safeItem, safeChildren } = useSafeItemProcessing(
	computed(() => props.item),
);

// Determine if this item is active based on current route or isActive property
const isActive = computed(() => isItemActive(safeItem.value, route.path));

// Use safe children from error boundary composable
const filteredChildren = computed(() => safeChildren.value);

// Check if item has children (using filtered children for better validation)
const hasChildren = computed(() => filteredChildren.value.length > 0);

// Single computed for all display properties to reduce reactivity overhead
const displayProps = computed(() => {
	const title = safeItem.value.title?.trim() || "Navigation Item";
	const tooltip = safeItem.value.tooltip?.trim() || title;
	const hasChildrenValue = filteredChildren.value.length > 0;

	return {
		title,
		tooltip,
		hasChildren: hasChildrenValue,
		ariaLabel: hasChildrenValue
			? `${title} ${props.level === 0 ? "menu" : "submenu"}, ${isActive.value ? "expanded" : "collapsed"}`
			: title,
		role: hasChildrenValue ? "button" : props.item.url ? "link" : "button",
		component: props.item.url ? "a" : "button",
	};
});

// Optimized key generation without caching overhead
const getChildKey = (
	childItem: AppSidebarItem,
	index: number,
	level: number,
): string => {
	// Use URL as primary key for uniqueness, fallback to deterministic combination
	return childItem.url || `${level}-${childItem.title}-${index}`;
};
</script>

<template>
  <!-- Root level item (level 0) -->
  <template v-if="level === 0">
    <SidebarMenuItem>
      <template v-if="hasChildren">
        <Collapsible as-child :default-open="isActive" class="group/collapsible">
          <div>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton
                :tooltip="displayProps.tooltip"
                :is-active="isActive"
                :as="displayProps.component"
                :href="item.url"
                :role="displayProps.role"
                :aria-expanded="isActive"
                :aria-label="displayProps.ariaLabel"
              >
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ displayProps.title }}</span>
                <ChevronRight
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  aria-hidden="true"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <AppSidebarItem
                  v-for="(childItem, index) in filteredChildren"
                  :key="getChildKey(childItem, index, level + 1)"
                  :item="childItem"
                  :level="level + 1"
                />
              </SidebarMenuSub>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </template>

      <template v-else>
        <SidebarMenuButton
          :tooltip="displayProps.tooltip"
          :is-active="isActive"
          :as="displayProps.component"
          :href="item.url"
          :role="displayProps.role"
        >
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ displayProps.title }}</span>
        </SidebarMenuButton>
      </template>
    </SidebarMenuItem>
  </template>

  <!-- Nested items (level > 0) -->
  <template v-else>
    <SidebarMenuSubItem>
      <template v-if="hasChildren">
        <Collapsible :default-open="isActive" class="group/collapsible w-full">
          <CollapsibleTrigger as-child>
            <SidebarMenuSubButton
              :is-active="isActive"
              :as="displayProps.component"
              :href="item.url"
              :aria-expanded="isActive"
              :aria-label="displayProps.ariaLabel"
              class="w-full"
            >
              <component :is="item.icon" v-if="item.icon" />
              <span>{{ displayProps.title }}</span>
              <ChevronRight
                class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                aria-hidden="true"
              />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="ml-4 mt-1 space-y-1">
              <AppSidebarItem
                v-for="(childItem, index) in filteredChildren"
                :key="getChildKey(childItem, index, level + 1)"
                :item="childItem"
                :level="level + 1"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </template>

      <template v-else>
        <SidebarMenuSubButton :is-active="isActive" :as="displayProps.component" :href="item.url">
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ displayProps.title }}</span>
        </SidebarMenuSubButton>
      </template>
    </SidebarMenuSubItem>
  </template>
</template>
