<template>
	<div
		class="form-control mb-2"
		:class="{
			'input-error': object === alert?.object && alert.type != 'Success',
			'input-success': object === alert?.object && alert.type == 'Success',
		}"
	>
		<label
			:for="name.lower"
			class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
		>
			{{ name }}
		</label>
		<div class="relative mb-6">
			<div
				class="pointer-events-none absolute inset-y-0 start-0 flex items-center px-[9px]"
			>
				<IconComp :name="(icon || name || '').lower"></IconComp>
			</div>
			<input
				v-model="model"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				:type="type"
				:disabled="disable"
				:required="required"
				:placeholder="placeholder || name"
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
