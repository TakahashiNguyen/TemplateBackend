<template>
	<div
		ref="carouselElement"
		class="relative w-full overflow-hidden rounded-lg"
		:style="{ '--duration': duration + 'ms' }"
	>
		<LoadingDiv ref="loadingDiv" class="absolute z-40" />
		<!-- Carousel wrapper -->
		<div
			ref="carouselWrapper"
			class="[&>*]:absolute! [&>*]:duration-(--duration) relative h-56 [&>*]:w-full [&>*]:ease-in-out"
		>
			<DivWrapper :is-slots="true">
				<slot name="content" />
			</DivWrapper>
		</div>
		<!-- Slider indicators -->
		<div
			:class="[indicatorsClasses]"
			class="absolute z-50 flex space-x-3"
			ref="carouselIndicatorsWrapper"
		/>
		<!-- Slider controls -->
		<div v-if="!$slots.buttons" class="[&>*]:z-50">
			<button
				ref="carouselPrevious"
				type="button"
				class="group absolute left-0 top-0 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
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
				</span>
			</button>
			<button
				ref="carouselNext"
				type="button"
				class="group absolute right-0 top-0 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
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
				</span>
			</button>
		</div>
		<div
			v-if="$slots.buttons"
			class="[&>*]:absolute [&>*]:left-0 [&>*]:top-0 [&>*]:z-50"
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
import { type PropType, onMounted, ref } from 'vue';

import DivWrapper from './DivWrapper.vue';
import LoadingDiv from './LoadingDiv.vue';

const carouselElement = ref<HTMLElement>(),
	carouselWrapper = ref<HTMLElement>(),
	carouselIndicatorsWrapper = ref<HTMLElement>(),
	carouselNext = ref<Element>(),
	carouselPrevious = ref<Element>(),
	next = getSlotRefSet(carouselNext),
	previous = getSlotRefSet(carouselPrevious),
	loadingDiv = ref<InstanceType<typeof LoadingDiv>>();

const props = defineProps({
	isCycle: { type: Boolean, default: false },
	overflowing: { type: Boolean, default: false },
	duration: { type: Number, default: 750 },
	cycleDuration: { type: Number, default: 3000 },
	indicator: {
		type: Object as PropType<
			Omit<Required<CarouselOptions['indicators']>, 'items'>
		>,
		default: {
			activeClasses: 'bg-white dark:bg-white/80',
			inactiveClasses:
				'bg-white/50 dark:bg-white/40 hover:bg-white/90 dark:hover:bg-white/70',
		},
	},
	indicatorsClasses: {
		type: [String, Object, Array],
		default: 'bottom-5 left-1/2 -translate-x-1/2',
	},
});

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
		interval: props.cycleDuration,

		indicators: {
			...props.indicator,
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
		if (carousel.getActiveItem().position != 0 || props.overflowing)
			carousel.prev();
	});

	carouselNext.value?.addEventListener('click', () => {
		if (
			carousel.getActiveItem().position + 1 < items.length ||
			props.overflowing
		)
			carousel.next();
	});

	loadingDiv.value?.toggleHidden();
});
</script>
