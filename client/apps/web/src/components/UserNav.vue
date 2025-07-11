<script setup lang="ts">
import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
} from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth";

const props = withDefaults(
	defineProps<{
		variant?: "full" | "compact";
	}>(),
	{
		variant: "full",
	},
);

const authStore = useAuthStore();

const variant = props.variant ?? "full";
const { isMobile } = useSidebar();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger :as-child="true">
      <component
        :is="variant === 'full' ? SidebarMenuButton : Button"
        :class="
          variant === 'full'
            ? 'size-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            : 'relative h-8 w-8 rounded-full'
        "
        variant="ghost"
      >
        <Avatar class="h-8 w-8" :class="variant === 'full' ? 'rounded-lg' : ''">
          <AvatarImage
            :src="authStore.account?.imageUrl ?? ''"
            :alt="authStore.account?.fullname || authStore.account?.firstname || ''"
          />
          <AvatarFallback :class="variant === 'full' ? 'rounded-lg' : ''">
            {{
              (authStore.account?.fullname || authStore.account?.firstname || "")
                .substring(0, 2)
                .toUpperCase()
            }}
          </AvatarFallback>
        </Avatar>

        <template v-if="variant === 'full'">
          <div class="grid flex-1 text-left text-sm leading-tight ml-2">
            <span class="truncate font-medium">{{
              authStore.account?.fullname || ""
            }}</span>
            <span class="truncate text-xs">{{ authStore.account?.email || "" }}</span>
          </div>
          <ChevronsUpDown class="ml-auto size-4" />
        </template>
      </component>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      :class="
        variant === 'full'
          ? 'w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg'
          : 'w-56'
      "
      :side="variant === 'full' ? (isMobile ? 'bottom' : 'right') : undefined"
      align="end"
      :side-offset="variant === 'full' ? 4 : undefined"
    >
      <DropdownMenuLabel class="font-normal p-0">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="h-8 w-8 rounded-lg">
            <AvatarImage
              :src="authStore.account?.imageUrl || ''"
              :alt="authStore.account?.fullname || authStore.account?.firstname || ''"
            />
            <AvatarFallback class="rounded-lg">
              {{
                (authStore.account?.fullname || authStore.account?.firstname || "")
                  .substring(0, 2)
                  .toUpperCase()
              }}
            </AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">{{
              authStore.account?.fullname || ""
            }}</span>
            <span class="truncate text-xs text-muted-foreground">{{
              authStore.account?.email || ""
            }}</span>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Sparkles />
          Upgrade to Pro
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BadgeCheck />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOut />
        Log out
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
