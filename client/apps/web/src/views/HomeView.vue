<script setup lang="ts">
import { onMounted } from "vue";
import Dashboard from "@/dashboard/Dashboard.vue";

onMounted(async () => {
	// Fetch actual revenue data from API
	// revenueData.value = await fetchRevenueData()
});
</script>

<template>
<Dashboard />
</template>


