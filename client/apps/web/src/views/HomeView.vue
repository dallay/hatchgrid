<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">Home Page</h1>
    <p>Welcome to the Hatchgrid web application!</p>
    <Button @click="goToAbout">Go to About Page</Button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '~/components/ui/button/Button.vue' // Adjusted path

const router = useRouter()
const goToAbout = () => {
  router.push('/about')
}
</script>
