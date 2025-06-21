<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b border-border">
      <nav class="container mx-auto px-4 py-2 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold">Hatchgrid</router-link>
        <div>
          <router-link to="/" class="px-3 py-2 hover:text-primary">Home</router-link>
          <router-link to="/about" class="px-3 py-2 hover:text-primary">About</router-link>
        </div>
      </nav>
    </header>
    <main class="container mx-auto p-4">
      <router-view />
    </main>
    <footer class="border-t border-border mt-8 py-4 text-center text-muted-foreground">
      <p>&copy; {{ new Date().getFullYear() }} Hatchgrid. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// No specific script needed for this basic layout
</script>

<style scoped>
/* Add any layout-specific styles here if needed */
.container {
  max-width: 1280px; /* Example responsive container width */
}
</style>
