import type { IAlert } from '@/error/interfaces';
import type { ErrorObject } from 'templatebackend';
import { computed } from 'vue';

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
	alert: IAlert;
	/** Target objects. */
	objects: ErrorObject[];
}) {
	return computed(() => input.objects.some((i) => i === input.alert.object));
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
	alert: IAlert;
}) {
	return computed(() => !getIsSuccess(input));
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
	alert: IAlert;
}) {
	return computed(() =>
		(['Success'] as IAlert['type'][]).some((i) => i == input.alert.type),
	);
}
