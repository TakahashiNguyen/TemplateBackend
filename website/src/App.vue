<script setup lang="ts">
import { initFlowbite } from 'flowbite';
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

onMounted(() => {
	initFlowbite();
});
</script>

<template>
	<RouterView />
</template>

<style scoped></style>
