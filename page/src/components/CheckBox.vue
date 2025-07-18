<template>
	<div class="flex h-7 items-center p-1">
		<div class="h-9/12 flex aspect-square">
			<input
				v-model="model"
				type="checkbox"
				value=""
				class="text--primary h-full w-full rounded-sm"
				:required="required"
			/>
		</div>
		<label class="ms-2 text-sm font-medium">
			{{ title }}
		</label>
	</div>
</template>

<script setup lang="ts">
const model = defineModel();
defineProps<{
	title: string;
	required?: boolean;
}>();
</script>
