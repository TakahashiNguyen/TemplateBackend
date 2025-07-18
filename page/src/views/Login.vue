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
		<div class="flex justify-between p-1">
			<CheckBox title="Remember me" />
			<a href="#" class="link text-sm"> Lost Password? </a>
		</div>
		<ButtonComp type="submit">Continue</ButtonComp>
		<div class="p-1 text-sm font-medium">
			Not registered?
			<a @click="router.push({ name: 'signup' })" class="link ml-1">
				Create account
			</a>
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
import { useRouter } from 'vue-router';

const alert = getAlert(),
	input = reactive<UserLoginDto>({
		email: '',
		authentication: {
			type: 'password',
			password: { value: '' },
		},
	}),
	handleLogin = () => apiErrorHandler(requester('/user/login', input), alert),
	router = useRouter(),
	// @ts-expect-error error-free expression
	forgetPasswordClick = async () =>
		apiErrorHandler(requester('change-password', input), alert);
</script>
