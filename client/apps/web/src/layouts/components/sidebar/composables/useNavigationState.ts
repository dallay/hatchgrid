/**
 * Navigation state management composable
 * Implements observer pattern for navigation state changes
 */

import { debounce } from "@hatchgrid/utilities";
import { computed, type Ref, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import type { AppSidebarItem } from "../types";
import {
	clearActiveParentsCache,
	findActiveParents,
	isItemActive,
} from "../utils";

interface NavigationState {
	currentRoute: string;
	activeItems: Set<string>;
	expandedItems: Set<string>;
	lastUpdated: number;
}

interface NavigationStateObserver {
	onActiveItemsChanged?: (activeItems: Set<string>) => void;
	onExpandedItemsChanged?: (expandedItems: Set<string>) => void;
	onRouteChanged?: (newRoute: string, oldRoute: string) => void;
}

type ObserverMethodArgs = {
	onActiveItemsChanged: [Set<string>];
	onExpandedItemsChanged: [Set<string>];
	onRouteChanged: [string, string];
};

class NavigationStateManager {
	private state = reactive<NavigationState>({
		currentRoute: "/",
		activeItems: new Set(),
		expandedItems: new Set(),
		lastUpdated: Date.now(),
	});

	private observers = new Set<NavigationStateObserver>();

	// Subscribe to state changes
	subscribe(observer: NavigationStateObserver) {
		this.observers.add(observer);
		return () => this.observers.delete(observer);
	}

	// Update current route and recalculate active items
	updateRoute(newRoute: string, items: AppSidebarItem[]) {
		const oldRoute = this.state.currentRoute;
		this.state.currentRoute = newRoute;

		// Clear cache when route changes
		clearActiveParentsCache();

		// Recalculate active items
		const newActiveItems = new Set<string>();
		const findActiveItemsRecursive = (navItems: AppSidebarItem[]) => {
			for (const item of navItems) {
				if (isItemActive(item, newRoute)) {
					newActiveItems.add(item.title);
				}
				if (item.items) {
					findActiveItemsRecursive(item.items);
				}
			}
		};

		findActiveItemsRecursive(items);

		// Update expanded items based on active parents
		const activeParents = findActiveParents(items, newRoute);
		const newExpandedItems = new Set(activeParents);

		// Notify observers
		this.notifyObservers("onRouteChanged", newRoute, oldRoute);
		this.updateActiveItems(newActiveItems);
		this.updateExpandedItems(newExpandedItems);

		this.state.lastUpdated = Date.now();
	}

	// Update active items
	private updateActiveItems(newActiveItems: Set<string>) {
		const hasChanged =
			newActiveItems.size !== this.state.activeItems.size ||
			[...newActiveItems].some((item) => !this.state.activeItems.has(item));

		if (hasChanged) {
			this.state.activeItems = newActiveItems;
			this.notifyObservers("onActiveItemsChanged", newActiveItems);
		}
	}

	// Update expanded items
	private updateExpandedItems(newExpandedItems: Set<string>) {
		const hasChanged =
			newExpandedItems.size !== this.state.expandedItems.size ||
			[...newExpandedItems].some((item) => !this.state.expandedItems.has(item));

		if (hasChanged) {
			this.state.expandedItems = newExpandedItems;
			this.notifyObservers("onExpandedItemsChanged", newExpandedItems);
		}
	}

	// Toggle expanded state for an item
	toggleExpanded(itemTitle: string) {
		if (this.state.expandedItems.has(itemTitle)) {
			this.state.expandedItems.delete(itemTitle);
		} else {
			this.state.expandedItems.add(itemTitle);
		}
		this.notifyObservers("onExpandedItemsChanged", this.state.expandedItems);
	}

	// Get current state (readonly)
	getState() {
		return {
			currentRoute: this.state.currentRoute,
			activeItems: new Set(this.state.activeItems),
			expandedItems: new Set(this.state.expandedItems),
			lastUpdated: this.state.lastUpdated,
		};
	}

	// Check if item is active
	isItemActive(itemTitle: string): boolean {
		return this.state.activeItems.has(itemTitle);
	}

	// Check if item is expanded
	isItemExpanded(itemTitle: string): boolean {
		return this.state.expandedItems.has(itemTitle);
	}

	private notifyObservers<K extends keyof NavigationStateObserver>(
		method: K,
		...args: ObserverMethodArgs[K]
	) {
		for (const observer of this.observers) {
			const callback = observer[method];
			if (callback) {
				try {
					(callback as (...cbArgs: ObserverMethodArgs[K]) => void)(...args);
				} catch (error) {
					console.error(`Navigation state observer error in ${method}:`, error);
				}
			}
		}
	}
}

// Singleton instance
const navigationStateManager = new NavigationStateManager();

/**
 * Composable for navigation state management
 */
export function useNavigationState(items: Ref<AppSidebarItem[]>) {
	const route = useRoute();

	// Watch for route changes
	watch(
		() => route.path,
		(newPath) => {
			navigationStateManager.updateRoute(newPath, items.value);
		},
		{ immediate: true },
	);

	const debouncedUpdate = debounce((newItems: unknown) => {
		navigationStateManager.updateRoute(
			route.path,
			newItems as AppSidebarItem[],
		);
	}, 100);

	watch(items, debouncedUpdate, { deep: true });

	// Reactive state
	const state = computed(() => navigationStateManager.getState());

	// Helper functions
	const isItemActive = (itemTitle: string) =>
		navigationStateManager.isItemActive(itemTitle);

	const isItemExpanded = (itemTitle: string) =>
		navigationStateManager.isItemExpanded(itemTitle);

	const toggleExpanded = (itemTitle: string) =>
		navigationStateManager.toggleExpanded(itemTitle);

	// Subscribe to state changes
	const subscribe = (observer: NavigationStateObserver) =>
		navigationStateManager.subscribe(observer);

	return {
		state,
		isItemActive,
		isItemExpanded,
		toggleExpanded,
		subscribe,
	};
}

/**
 * Global navigation state access
 */
export function useGlobalNavigationState() {
	return {
		getState: () => navigationStateManager.getState(),
		subscribe: (observer: NavigationStateObserver) =>
			navigationStateManager.subscribe(observer),
	};
}
