<template>
	<div class="center h-dvh">
		<div
			class="bg--0 tablet:w-lg desktop:w-4xl desktop:h-fit tablet:h-fit h-dvh w-dvw rounded-lg p-8"
		>
			<form
				class="justify-center-safe desktop:flex-row desktop:justify-between flex h-full flex-col space-y-6"
				@submit.prevent="buttonHandler"
			>
				<h5 class="text-3xl font-medium" v-if="title">
					{{ title }}
				</h5>
				<div class="desktop:w-md w-full space-y-6">
					<slot />
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	title?: string;
	buttonHandler: () => void;
}>();
</script>
