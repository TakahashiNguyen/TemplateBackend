<template>
	<div
		class="primary-text mb-2 flex flex-col"
		:class="{
			'input-error': object === alert?.object && alert.type != 'Success',
			'input-success': object === alert?.object && alert.type == 'Success',
		}"
	>
		<label
			class="z-1 primary-black-white-background -mb-2 ml-2 block w-fit text-sm font-medium"
		>
			{{ name }}
		</label>
		<div class="relative z-0 mb-6">
			<div
				v-if="icon"
				class="pointer-events-none absolute inset-y-0 start-0 flex items-center px-[9px]"
			>
				<IconComp :name="icon.lower"></IconComp>
			</div>
			<input
				v-model="model"
				:class="{ 'ps-10!': icon }"
				class="border-dark-primary black-and-white-text w-full rounded-lg border bg-transparent p-2.5"
				:type="type"
				:disabled="disable"
				:required="required"
				:placeholder="placeholder"
			/>
		</div>
		<p class="mt-2 text-sm" v-if="alert.message">
			{{ alert.message }}
		</p>
	</div>
</template>

<script setup lang="ts">
import IconComp from '@/components/IconComp.vue';
import type { IAlert } from '@/error/interfaces';
import { type ErrorObject } from 'templatebackend';

const model = defineModel();
defineProps<{
	name: string;
	type: 'password' | 'text';
	object: ErrorObject;
	alert: IAlert;
	icon?: string;
	placeholder?: string;
	disable?: boolean;
	required?: boolean;
}>();
</script>
