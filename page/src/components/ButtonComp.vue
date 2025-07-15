<template>
	<button
		:type="type"
		class="primary-text primary-background w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium"
	>
		{{ text }}
	</button>
</template>

<script setup lang="ts">
defineProps<{ type: HTMLButtonElement['type']; text: string }>();
</script>
