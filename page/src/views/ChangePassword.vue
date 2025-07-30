<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
	<FormContainerComp
		btn-label="Confirm"
		:button-handler="handleRequest"
		:alert="alert"
		name="Change password"
	>
		<FormTextInputComp
			name="Signature"
			v-model="$route.params.signature"
			:disable="true"
			object="signature"
			:alert="alert"
			type="text"
		></FormTextInputComp>
		<FormTextInputComp
			name="New Password"
			placeholder="Enter password"
			icon="key_vertical"
			v-model="input.authentication.password.value"
			:alert="alert"
			object="password"
			type="password"
		></FormTextInputComp>
	</FormContainerComp>
</template>

<script setup lang="ts">
import { requester } from '@/api/functions';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/TextInputComp.vue';
import { apiErrorHandler, getAlert } from '@/error/functions';
import { UserLoginDto } from 'templatebackend-types';
import { reactive } from 'vue';

const alert = getAlert(),
	input = reactive<UserLoginDto>({
		email: '',
		authentication: { type: 'password', password: { value: '' } },
	}),
	handleRequest = () =>
		apiErrorHandler(requester('/change-password', input), alert);
</script>
