<template>
	<FormContainerComp
		:button-handler="handleLogin"
		title="Login to our platform"
	>
		<FormTextInputComp
			name="Email"
			v-model="input.email"
			type="text"
			:alert="alert"
			object="User"
		/>
		<FormTextInputComp
			name="Password"
			v-model="input.authentication.password.value"
			:alert="alert"
			type="password"
			object="Authentication"
		/>
		<div class="flex justify-between">
			<CheckBox title="Remember me" />
			<a href="#" class="link text-sm"> Lost Password? </a>
		</div>
		<ButtonComp type="submit" text="Continue" />
		<div class="text-sm font-medium">
			Not registered?
			<a href="#" class="link"> Create account </a>
		</div>
	</FormContainerComp>
</template>

<script setup lang="ts">
import { requester } from '@/api/functions';
import ButtonComp from '@/components/ButtonComp.vue';
import CheckBox from '@/components/CheckBox.vue';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/TextInputComp.vue';
import { apiErrorHandler, getAlert } from '@/error/functions';
import { UserLoginDto } from 'templatebackend';
import { reactive } from 'vue';

const alert = getAlert(),
	input = reactive<UserLoginDto>({
		email: '',
		authentication: {
			type: 'password',
			password: { value: '' },
		},
	}),
	handleLogin = () => apiErrorHandler(requester('login', input), alert),
	forgetPasswordClick = async () =>
		apiErrorHandler(requester('change-password', input), alert);
</script>
