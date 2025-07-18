<template>
	<button
		:ref="buttonRef"
		:type
		class="primary-text primary-background w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium"
	>
		<slot />
	</button>
</template>

<script setup lang="ts">
import { type PropType, type VNodeRef } from 'vue';

defineProps({
	type: {
		type: String as PropType<HTMLButtonElement['type']>,
		default: 'button',
	},
	buttonRef: {
		type: Object as PropType<VNodeRef>,
		required: false,
	},
});
</script>
