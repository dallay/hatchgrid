<script setup lang="ts">
import { cn } from "@/lib/utils.ts";
</script>

<template>
  <nav :class="cn('flex items-center space-x-4 lg:space-x-6', $attrs.class ?? '')">
    <router-link
      to="/dashboard"
      class="text-sm font-medium transition-colors hover:text-primary"
      active-class="text-primary"
      exact
    >
      Overview
    </router-link>
    <router-link
      to="/customers"
      class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      active-class="text-primary"
    >
      Customers
    </router-link>
    <router-link
      to="/products"
      class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      active-class="text-primary"
    >
      Products
    </router-link>
    <router-link
      to="/settings"
      class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      active-class="text-primary"
    >
      Settings
    </router-link>
  </nav>
</template>
