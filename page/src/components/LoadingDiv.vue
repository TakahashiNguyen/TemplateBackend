<template>
	<div
		class="h-full w-full bg-white dark:bg-black"
		:class="{ hidden: isHidden }"
	>
		<div class="h-full w-full animate-pulse bg-black/10 dark:bg-white/10"></div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isHidden = ref<Boolean>(false);

function toggleHidden() {
	isHidden.value = !isHidden.value;
}

defineExpose({ toggleHidden });
</script>
