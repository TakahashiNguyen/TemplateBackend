<template>
	<div class="p-1">
		<button
			:ref="buttonRef"
			:type
			class="w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium"
			:class="{
				'text--primary bg--primary hover:text--secondary hover:bg--secondary':
					theme == 'primary',
				'hover:bg--secondary': theme == 'secondary',
			}"
		>
			<slot />
		</button>
	</div>
</template>

<script setup lang="ts">
import { type PropType, type VNodeRef } from 'vue';

defineProps({
	type: {
		type: String as PropType<HTMLButtonElement['type']>,
		default: 'button',
	},
	theme: {
		type: String as PropType<'primary' | 'secondary'>,
		default: 'primary',
	},
	buttonRef: {
		type: Function as unknown as PropType<VNodeRef>,
		required: false,
	},
});
</script>
