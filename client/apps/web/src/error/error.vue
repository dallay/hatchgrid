<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 class="text-4xl font-bold mb-4">{{ $t('error.title') }}</h1>
      <p class="text-lg mb-6">{{ $t('error.message') }}</p>
      <!-- Optional illustration placeholder -->
      <div class="mb-6">
        <!-- <img src="/path/to/your/illustration.svg" alt="Error Illustration" class="mx-auto w-64 h-64"> -->
      </div>
      <RouterLink to="/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        {{ $t('error.backToHome') }}
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>