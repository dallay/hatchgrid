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

// Determine if this item is active based on current route or isActive property
const isActive = computed(() => isItemActive(props.item, route.path));

// Determine tooltip text with fallback
const tooltipText = computed(() => props.item.tooltip || props.item.title || 'Navigation Item');

// Check if item has children (using filtered children for better validation)
const hasChildren = computed(() => filteredChildren.value.length > 0);

// Memoized ARIA label computation with better accessibility
const ariaLabel = computed(() => {
  const title = props.item.title || 'Navigation Item';
  if (!hasChildren.value) return title;

  const menuType = props.level === 0 ? 'menu' : 'submenu';
  const expandedState = isActive.value ? 'expanded' : 'collapsed';
  return `${title} ${menuType}, ${expandedState}`;
});

// Improved role determination for better screen reader support
const roleAttribute = computed(() => {
  if (hasChildren.value) return 'button';
  return props.item.url ? 'link' : 'button';
});

// Generate stable key for child items to improve rendering performance
const getChildKey = (childItem: AppSidebarItem, index: number) => {
  // Use URL as primary key, fallback to title-index combination
  if (childItem.url) return childItem.url;

  // Create a more stable key by including level to avoid conflicts
  return `${props.level}-${childItem.title}-${index}`;
};

// Memoized component type determination
const linkComponent = computed(() => props.item.url ? 'a' : 'button');

// Memoized children filtering for better performance with validation
const filteredChildren = computed(() => {
  if (!props.item.items?.length) return [];

  return props.item.items.filter(child => {
    // More robust validation
    return child &&
           typeof child.title === 'string' &&
           child.title.trim().length > 0;
  });
});
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
