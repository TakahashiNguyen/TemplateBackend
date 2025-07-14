<template>
	<FormContainerComp
		btn-label="Login"
		:button-handler="handleLogin"
		:alert="alert"
		name="Login"
	>
		<FormTextInputComp
			name="Email"
			placeholder="name@email.com"
			v-model="input.email"
			type="text"
			:alert="alert"
			object="User"
		></FormTextInputComp>
		<FormTextInputComp
			name="Password"
			placeholder="Enter password"
			icon="key_vertical"
			v-model="input.authentication.password.value"
			:alert="alert"
			type="password"
			object="Authentication"
			:sub-btn-click="forgetPasswordClick"
		>
			Forgot password?
		</FormTextInputComp>
		<div class="flex items-start">
			<div class="flex items-start">
				<div class="flex h-5 items-center">
					<input
						id="remember"
						type="checkbox"
						value=""
						class="focus:ring-3 h-4 w-4 rounded-sm border border-gray-300 bg-gray-50 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800"
						required
					/>
				</div>
				<label
					for="remember"
					class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>
					Remember me
				</label>
			</div>
			<a
				href="#"
				class="ms-auto text-sm text-blue-700 hover:underline dark:text-blue-500"
			>
				Lost Password?
			</a>
		</div>
		<button
			type="submit"
			class="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
		>
			Login your account
		</button>
		<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
			Not registered?
			<a href="#" class="text-blue-700 hover:underline dark:text-blue-500">
				Create account
			</a>
		</div>
	</FormContainerComp>
</template>

<script setup lang="ts">
import { requester } from '@/api/functions';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/FormTextInputComp.vue';
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
