<template>
	<div
		class="text--primary bg--0 flex flex-col p-1"
		:class="{
			'text-error!': isObject && isError,
			'text-success!': isObject && isSuccess,
		}"
	>
		<label class="z-1 bg--0 -mb-2 ml-2 block w-fit text-sm font-medium">
			{{ name }}
		</label>
		<div class="relative z-0">
			<div
				v-if="icon"
				class="pointer-events-none absolute inset-y-0 start-0 flex items-center px-[9px]"
			>
				<IconComp :name="icon.lower"></IconComp>
			</div>
			<input
				v-model="model"
				:class="{
					'ps-10!': icon,
					'border-error!': isObject && isError,
					'border-success!': isObject && isSuccess,
				}"
				class="border--primary text--0 w-full rounded-lg border bg-transparent p-2.5"
				:type="type"
				:disabled="disable"
				:placeholder="placeholder"
			/>
		</div>
		<p class="mt-1 text-sm" v-if="alert?.message && isObject">
			{{ alert.message }}
		</p>
	</div>
</template>

<script setup lang="ts">
import { getIsError, getIsObject, getIsSuccess } from '@/app/functions';
import IconComp from '@/components/IconComp.vue';
import type { IAlert } from '@/error/interfaces';
import { type ErrorObject } from 'templatebackend';
import type { PropType } from 'vue';

const model = defineModel(),
	props = defineProps({
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String as PropType<HTMLInputElement['type']>,
			default: 'text',
		},
		objects: {
			type: Array as PropType<ErrorObject[]>,
			required: false,
		},
		alert: {
			type: Object as PropType<IAlert>,
			required: false,
		},
		icon: { type: String, required: false },
		placeholder: { type: String, required: false },
		disable: { type: Boolean, required: false },
	}),
	isObject = getIsObject(props),
	isError = getIsError(props),
	isSuccess = getIsSuccess(props);
</script>
