<template>
	<FormContainerComp
		:button-handler="handleSignup"
		title="Signup to our platform"
	>
		<CarouselComp
			indicators-location="-bottom-15 p-1"
			:indicator="{
				activeClasses: 'bg-light-primary/90',
				inactiveClasses: 'bg-light-primary/50 hover:bg-light-primary/70',
			}"
			class="mb-20"
		>
			<template #buttons="{ next, isEnd, previous, isStart }">
				<div
					class="-bottom-15 right-0 flex h-8 w-fit items-center justify-center [&>*]:ml-2"
				>
					<ButtonComp
						:button-ref="previous"
						theme="secondary"
						:class="{ hidden: isStart }"
					>
						Previous
					</ButtonComp>
					<ButtonComp :button-ref="next" :class="{ hidden: isEnd }">
						Next
					</ButtonComp>
					<ButtonComp type="submit" :class="{ hidden: !isEnd }">
						Continue
					</ButtonComp>
				</div>
			</template>
			<template #content>
				<div class="">
					<FormTextInputComp name="Name" v-model="input.name" />
				</div>
				<div class="space-y-6">
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
				</div>
			</template>
		</CarouselComp>
		<div class="flex items-center p-1 text-sm font-medium">
			<span> Registered? </span>
			<ButtonComp to="login" type="link"> Login account </ButtonComp>
		</div>
	</FormContainerComp>
</template>

<script setup lang="ts">
import { requester } from '@/api/functions';
import ButtonComp from '@/components/ButtonComp.vue';
import CarouselComp from '@/components/CarouselComp.vue';
import FormContainerComp from '@/components/FormContainerComp.vue';
import FormTextInputComp from '@/components/TextInputComp.vue';
import { apiErrorHandler, getAlert } from '@/error/functions';
import { UserSignupDto } from 'templatebackend';
import { reactive } from 'vue';

const alert = getAlert(),
	input = reactive<UserSignupDto>({
		email: '',
		authentication: {
			password: { value: '' },
		},
		name: '',
		urlVisit: '',
		urlManageNotifications: '',
	}),
	handleSignup = () => apiErrorHandler(requester('/user/signup', input), alert);
</script>
