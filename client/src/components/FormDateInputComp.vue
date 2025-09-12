<template>
	<div class="form-control mb-2">
		<label class="label -mb-1.5">
			<span class="label-text">{{ name }}</span>
		</label>
		<label
			class="input input-bordered relative -mb-5 flex w-full items-center gap-2"
			:class="{
				'input-error': object === alert?.object && alert?.type !== 'Success',
				'input-success': object === alert?.object && alert?.type === 'Success',
			}"
		>
			<IconComp name="event" />
			<input
				datepicker
				datepicker-buttons
				datepicker-orientation="top left"
				datepicker-format="yyyy-mm-dd"
				placeholder="Select date"
				@focusout="updateValue(datepickerRef!.value)"
				:disabled="disable"
				:name="name + 'DatePicker'"
				ref="datepickerRef"
			/>
		</label>
		<label v-if="object === alert?.object" class="label -my-1.5">
			<span
				class="label-text-alt"
				:class="{
					'text-green-700': alert?.type === 'Success',
					'text-red-700': alert?.type !== 'Success',
				}"
			>
				{{ alert?.message }}
			</span>
		</label>
	</div>
	<label v-if="subBtnClick" class="label -mt-3">
		<a href="#" class="label-text-alt link link-hover" @click="subBtnClick">
			<slot />
		</a>
	</label>
</template>

<script setup lang="ts">
import type { IAlert } from '@/error/interfaces';
import type { ErrorObject } from 'types';
import { ref, watch } from 'vue';

const props = defineProps<{
		name: string;
		object?: ErrorObject;
		subBtnClick?: () => void;
		alert?: IAlert;
		icon?: string;
		disable?: boolean;
		modelValue: Date;
	}>(),
	datepickerRef = ref<HTMLInputElement | null>(null),
	emit = defineEmits<{
		(e: 'update:modelValue', value: Date): void;
	}>();

const updateValue = (value: string) => {
	const date = new Date(value);
	if (date instanceof Date && !isNaN(date.getTime()))
		emit('update:modelValue', new Date(value));
};

watch(
	() => props.modelValue,
	(newValue: Date) => {
		if (datepickerRef.value) {
			datepickerRef.value.value = new Date(newValue).toISOString().slice(0, 10);
		}
	},
);
</script>
