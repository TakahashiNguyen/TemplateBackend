<template>
	<div class="center h-dvh w-dvw">
		<div
			class="w-full rounded-lg border border-transparent bg-white p-4 md:max-w-lg md:border-gray-200 md:p-8 md:shadow-sm dark:bg-gray-800 md:dark:border-gray-700"
		>
			<form class="space-y-6" @submit.prevent="buttonHandler">
				<h5 class="text-xl font-medium text-gray-900 dark:text-white">
					{{ name }} to our platform
				</h5>
				<slot />
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	name: string;
	buttonHandler: () => void;
}>();
</script>
