import type { IAlert } from '@/error/interfaces';
import type { ErrorObject } from 'templatebackend-types';
import { type Ref, type VNodeRef, computed } from 'vue';

/**
 * Check if alert object match with target objects.
 *
 * @example
 *
 * ```ts
 * getIsObject(props);
 * ```
 *
 * @param {object} input
 * @param {IAlert} input.alert
 * @param {ErrorObject[]} input.objects
 */
export function getIsObject(input: {
	/** Alert variable. */
	alert?: IAlert;
	/** Target objects. */
	objects?: ErrorObject[];
}) {
	return computed(() => input.objects?.some((i) => i === input.alert?.object));
}

/**
 * Check if alert is an error.
 *
 * @example
 *
 * ```ts
 * getIsError(props);
 * ```
 *
 * @param {object} input
 * @param {IAlert} input.alert
 */
export function getIsError(input: {
	/** Alert variable. */
	alert?: IAlert;
}) {
	return computed(() => !getIsSuccess(input).value);
}

/**
 * Check if alert is a success.
 *
 * @example
 *
 * ```ts
 * getIsSuccess(props);
 * ```
 *
 * @param {object} input
 * @param {IAlert} input.alert
 */
export function getIsSuccess(input: {
	/** Alert variable. */
	alert?: IAlert;
}) {
	return computed(() =>
		(['Success'] as IAlert['type'][]).some((i) => i == input.alert?.type),
	);
}

/**
 * Create value passthrough from slot.
 *
 * @example
 *
 * ```ts
 * const foo = getSlotRefSet(input);
 * ```
 *
 * @template T
 * @param {Ref<T>} input - Ref input.
 */
export function getSlotRefSet<T>(input: Ref<T>): VNodeRef {
	// @ts-expect-error error-free expression
	return (i: T) => {
		input.value = i;
	};
}

/**
 * Function wait page fully loaded.
 *
 * @example
 *
 * ```ts
 * await waitForPageLoad();
 * ```
 */
export function waitForPageLoad(): Promise<void> {
	return new Promise((resolve) => {
		if (document.readyState === 'complete') {
			resolve();
		} else {
			window.addEventListener('load', () => resolve(), { once: true });
		}
	});
}

/**
 * Sleep function.
 *
 * @example
 *
 * ```ts
 * sleep(1000); // sleep for a second.
 * ```
 *
 * @param {number} ms - Milliseconds of sleep.
 * @returns {Promise<void>} Sleep async for await.
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
