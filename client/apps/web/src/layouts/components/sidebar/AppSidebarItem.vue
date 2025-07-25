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
import { computed, onUnmounted } from "vue";
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

// Memoized safe title with fallback - shared across computeds
const safeTitle = computed(() => {
	const title = safeItem.value.title?.trim();
	return title && title.length > 0 ? title : "Navigation Item";
});

// Memoized tooltip text with fallback
const tooltipText = computed(() => {
	const tooltip = safeItem.value.tooltip?.trim();
	return tooltip && tooltip.length > 0 ? tooltip : safeTitle.value;
});

// Memoized ARIA label computation with better accessibility
const ariaLabel = computed(() => {
	if (!hasChildren.value) return safeTitle.value;

	const menuType = props.level === 0 ? "menu" : "submenu";
	const expandedState = isActive.value ? "expanded" : "collapsed";
	return `${safeTitle.value} ${menuType}, ${expandedState}`;
});

// Improved role determination for better screen reader support
const roleAttribute = computed(() => {
	if (hasChildren.value) return "button";
	return props.item.url ? "link" : "button";
});

// Memoized stable key generation for child items with cleanup
const keyCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

const getChildKey = (childItem: AppSidebarItem, index: number): string => {
	// Create cache key from item properties
	const cacheKey = `${childItem.url || ""}-${childItem.title}-${index}-${props.level}`;

	const cachedKey = keyCache.get(cacheKey);
	if (cachedKey) {
		return cachedKey;
	}

	// Prevent memory leaks by limiting cache size
	if (keyCache.size >= MAX_CACHE_SIZE) {
		const firstKey = keyCache.keys().next().value;
		if (firstKey) keyCache.delete(firstKey);
	}

	// Use URL as primary key, fallback to title-index combination
	const key = childItem.url || `${props.level}-${childItem.title}-${index}`;
	keyCache.set(cacheKey, key);

	return key;
};

// Cleanup on unmount
onUnmounted(() => {
	keyCache.clear();
});

// Memoized component type determination
const linkComponent = computed(() => (props.item.url ? "a" : "button"));
</script>

<template>
  <!-- Root level item (level 0) -->
  <template v-if="level === 0">
    <SidebarMenuItem>
      <template v-if="hasChildren">
        <Collapsible
          as-child
          :default-open="isActive"
          class="group/collapsible"
        >
          <div>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton
                :tooltip="tooltipText"
                :is-active="isActive"
                :as="linkComponent"
                :href="item.url"
                :role="roleAttribute"
                :aria-expanded="isActive"
                :aria-label="ariaLabel"
              >
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
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
                  :key="getChildKey(childItem, index)"
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
          :tooltip="tooltipText"
          :is-active="isActive"
          :as="linkComponent"
          :href="item.url"
          :role="roleAttribute"
        >
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ item.title }}</span>
        </SidebarMenuButton>
      </template>
    </SidebarMenuItem>
  </template>

  <!-- Nested items (level > 0) -->
  <template v-else>
    <SidebarMenuSubItem>
      <template v-if="hasChildren">
        <Collapsible
          :default-open="isActive"
          class="group/collapsible w-full"
        >
          <CollapsibleTrigger as-child>
            <SidebarMenuSubButton
              :is-active="isActive"
              :as="linkComponent"
              :href="item.url"
              :aria-expanded="isActive"
              :aria-label="ariaLabel"
              class="w-full"
            >
              <component :is="item.icon" v-if="item.icon" />
              <span>{{ item.title }}</span>
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
                :key="getChildKey(childItem, index)"
                :item="childItem"
                :level="level + 1"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </template>

      <template v-else>
        <SidebarMenuSubButton
          :is-active="isActive"
          :as="linkComponent"
          :href="item.url"
        >
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ item.title }}</span>
        </SidebarMenuSubButton>
      </template>
    </SidebarMenuSubItem>
  </template>
</template>
