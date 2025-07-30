<template>
	<div class="form-control mb-2">
		<label class="label -mb-1.5">
			<span class="label-text">{{ name }}</span>
		</label>
		<select
			class="select select-bordered w-full"
			v-model="model"
			:class="{
				'input-error': object === alert?.object && alert?.type === 'Fatal',
				'input-success': object === alert?.object && alert?.type === 'Success',
			}"
		>
			<option v-for="i in list" v-bind:key="i[0]" :value="i[1]">
				{{ i[0].replace('_', ' ') }}
			</option>
		</select>
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
import type { ErrorObject } from 'templatebackend-types';

const model = defineModel();
defineProps<{
	name: string;
	subBtnClick?: () => void;
	object?: ErrorObject;
	alert?: IAlert;
	list: Map<string, string>;
}>();
</script>
