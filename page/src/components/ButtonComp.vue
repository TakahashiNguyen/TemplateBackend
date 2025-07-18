<template>
	<div class="p-1">
		<button
			v-if="type !== 'link'"
			:ref="buttonRef"
			:type
			class="w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium"
			:class="{
				'text--primary bg--primary hover:text--secondary hover:bg--secondary':
					theme == 'primary',
				'text--tertiary hover:bg--tertiary hover:-text--0':
					theme == 'secondary',
			}"
		>
			<slot />
		</button>
		<a
			class="link"
			v-if="type === 'link'"
			href="#"
			@click="to ? $router.push({ name: to }) : ''"
		>
			<slot />
		</a>
	</div>
</template>

<script setup lang="ts">
import { type PropType, type VNodeRef } from 'vue';

defineProps({
	type: {
		type: String as PropType<HTMLButtonElement['type'] | 'link'>,
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
	to: {
		type: String,
		required: false,
	},
});
</script>
