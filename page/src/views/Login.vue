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
			:objects="['Email', 'User']"
		/>
		<FormTextInputComp
			name="Password"
			v-model="input.authentication.password.value"
			type="password"
			:alert="alert"
			:objects="['Authentication']"
		/>
		<div class="flex items-center justify-between text-sm">
			<CheckBox title="Remember me" />
			<ButtonComp type="link"> Lost Password? </ButtonComp>
		</div>
		<ButtonComp type="submit">Continue</ButtonComp>
		<div class="flex items-center p-1 text-sm font-medium">
			<span> Not registered? </span>
			<ButtonComp type="link" to="signup"> Create account </ButtonComp>
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
	handleLogin = () => apiErrorHandler(requester('/user/login', input), alert),
	// @ts-expect-error error-free expression
	forgetPasswordClick = async () =>
		apiErrorHandler(requester('change-password', input), alert);
</script>
