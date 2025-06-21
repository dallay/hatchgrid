<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">About Page</h1>
    <p>This is the about page.</p>
    <Button variant="secondary" @click="goToHome">Go to Home Page</Button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '~/components/ui/button/Button.vue' // Adjusted path

const router = useRouter()
const goToHome = () => {
  router.push('/')
}
</script>
