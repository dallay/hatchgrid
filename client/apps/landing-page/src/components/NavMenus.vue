<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-vue-next"; // Assuming lucide-vue-next is installed
import { ref } from "vue";

import { type Lang, useTranslatedPath, useTranslations } from "@/i18n";
import type { MenuItem } from "@/models/menu/menu.type";

const props = defineProps<{
	menuItems: MenuItem[];
	lang: Lang;
	currentPath: string;
}>();

const t = useTranslations(props.lang);
const translatePath = useTranslatedPath(props.lang);

const isMobileMenuOpen = ref(false);

const getLinkClass = (href: string) => {
	return props.currentPath === translatePath(href)
		? "text-primary-700 dark:text-primary-400 font-semibold"
		: "";
};
</script>

<template>
  <div>
    <!-- Mobile Menu Trigger and Sheet -->
    <div class="lg:hidden">
      <Sheet v-model:open="isMobileMenuOpen">
        <SheetTrigger as-child>
          <Button variant="ghost" size="icon">
            <Menu class="h-6 w-6" />
            <span class="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="w-[300px] sm:w-[400px]">
          <SheetHeader class="mb-4">
            <SheetTitle>
              <a href="/" @click="isMobileMenuOpen = false">Menu</a>
            </SheetTitle>
          </SheetHeader>
          <div class="flex flex-col gap-2">
            <template v-for="item in props.menuItems" :key="item.translationKey">
              <template v-if="item.condition">
                <Button
                  v-if="item.type === 'link'"
                  variant="ghost"
                  as-child
                  class="justify-start text-base"
                  :class="getLinkClass(item.href)"
                  @click="isMobileMenuOpen = false"
                >
                  <a :href="translatePath(item.href)">{{ t(item.translationKey) }}</a>
                </Button>
                <div v-if="item.type === 'dropdown'">
                  <p class="px-4 py-2 font-semibold text-base text-gray-800 dark:text-gray-200">{{ t(item.translationKey) }}</p>
                  <!-- Iterate over children of DropdownMenuItem -->
                  <template v-for="child in item.children" :key="child.translationKey">
                    <!-- Add a type guard for child items -->
                    <Button
                      v-if="child.type === 'link'"
                      variant="ghost"
                      as-child
                      class="justify-start text-base ml-4"
                      :class="getLinkClass(child.href)"
                      @click="isMobileMenuOpen = false"
                    >
                      <a :href="translatePath(child.href)">{{ t(child.translationKey) }}</a>
                    </Button>
                    <!-- You could add v-else-if here to handle other child types,
                         e.g., if a dropdown could contain another nested dropdown -->
                  </template>
                </div>
              </template>
            </template>
          </div>
        </SheetContent>
      </Sheet>
    </div>

    <!-- Desktop Menu -->
    <NavigationMenu class="hidden lg:flex">
      <NavigationMenuList>
        <template v-for="item in props.menuItems" :key="item.translationKey">
          <template v-if="item.condition">
            <NavigationMenuItem v-if="item.type === 'link'">
              <NavigationMenuLink as-child>
                <Button
                  variant="ghost"
                  :class="`text-base ${getLinkClass(item.href)}`"
                >
                  <a :href="translatePath(item.href)">{{ t(item.translationKey) }}</a>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem v-if="item.type === 'dropdown'">
              <NavigationMenuTrigger
                class="text-base font-medium transition-colors bg-transparent hover:text-primary-700 dark:hover:text-primary-400 focus:outline-none dark:bg-transparent"
                :class="item.children?.some(child => child.type === 'link' && props.currentPath === translatePath(child.href)) ? 'text-primary-700 dark:text-primary-400 font-semibold' : ''"
              >
                {{ t(item.translationKey) }}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid gap-3 p-4 lg:grid-cols-[.75fr_1fr]">
                  <template v-for="child in item.children" :key="child.translationKey">
                    <template v-if="child.condition && child.type === 'link'">
                      <li>
                        <NavigationMenuLink as-child>
                          <a
                            :href="translatePath(child.href)"
                            :class="`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${getLinkClass(child.href)}`"
                          >
                            <div class="text-sm font-medium leading-none">{{ t(child.translationKey) }}</div>

                          </a>
                        </NavigationMenuLink>
                      </li>
                    </template>
                  </template>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </template>
        </template>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</template>
