<template>
	<div ref="carouselElement" class="relative w-full">
		<!-- Carousel wrapper -->
		<div
			ref="carouselWrapper"
			class="relative rounded-lg [&>*]:w-full [&>*]:basis-1/3 [&>*]:duration-700 [&>*]:ease-in-out overflow-hidden"
		>
			<DivWrapper :is-slots="true">
				<slot name="content" />
			</DivWrapper>
		</div>
		<!-- Slider indicators -->
		<div
			class="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 space-x-3"
			ref="carouselIndicatorsWrapper"
		/>
		<!-- Slider controls -->
		<div v-if="!$slots.buttons">
			<button
				ref="carouselPrevious"
				type="button"
				class="group absolute left-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
			>
				<span
					class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70"
				>
					<svg
						class="h-4 w-4 text-white dark:text-gray-800"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 6 10"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 1 1 5l4 4"
						/>
					</svg>
					<span class="hidden">Previous</span>
				</span>
			</button>
			<button
				ref="carouselNext"
				type="button"
				class="group absolute right-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
			>
				<span
					class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70"
				>
					<svg
						class="h-4 w-4 text-white dark:text-gray-800"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 6 10"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m1 9 4-4-4-4"
						/>
					</svg>
					<span class="hidden">Next</span>
				</span>
			</button>
		</div>
		<div
			v-if="$slots.buttons"
			class="[&>*]:z-100 [&>*]:absolute [&>*]:left-0 [&>*]:top-0"
		>
			<slot name="buttons" :next="next" :previous="previous" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { getSlotRefSet, waitForPageLoad } from '@/app/functions';
import { Carousel } from 'flowbite';
import type {
	CarouselInterface,
	CarouselItem,
	CarouselOptions,
	RotationItems,
} from 'flowbite';
import { onMounted, ref } from 'vue';

import DivWrapper from './DivWrapper.vue';

const carouselElement = ref<HTMLElement>(),
	carouselWrapper = ref<HTMLElement>(),
	carouselIndicatorsWrapper = ref<HTMLElement>(),
	carouselNext = ref<Element>(),
	carouselPrevious = ref<Element>(),
	next = getSlotRefSet(carouselNext),
	previous = getSlotRefSet(carouselPrevious);

const props = defineProps<{
	isCycle?: boolean;
}>();

class CustomCarousel extends Carousel {
	_rotate(rotationItems: RotationItems): void {
		super._rotate(rotationItems);

		// update carousel height
		carouselElement.value!.style.height = carouselWrapper.value!.style.height =
			rotationItems.middle.el.children[0].clientHeight.toString() + 'px';
	}
}

onMounted(async () => {
	const items: CarouselItem[] = Array.from(carouselWrapper.value!.children).map(
			(el, i) => ({
				position: i,
				el: el as HTMLElement,
			}),
		),
		carouselIndicators = items.map(() => {
			const button = document.createElement('button');
			button.className = 'h-3 w-3 rounded-full';
			button.type = 'button';

			return button;
		});

	carouselIndicators.forEach((i) => carouselIndicatorsWrapper.value?.append(i));

	const options: CarouselOptions = {
		defaultPosition: 0,
		interval: 3000,

		indicators: {
			activeClasses: 'bg-white dark:bg-gray-800',
			inactiveClasses:
				'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800',
			items: Array.from(carouselIndicators).map((el, i) => ({
				position: i,
				el,
			})),
		},
	};

	await waitForPageLoad();

	const carousel: CarouselInterface = new CustomCarousel(
		carouselElement.value,
		items,
		options,
		{},
	);

	if (props.isCycle) carousel.cycle();

	carouselPrevious.value?.addEventListener('click', () => {
		carousel.prev();
	});

	carouselNext.value?.addEventListener('click', () => {
		carousel.next();
	});
});
</script>
