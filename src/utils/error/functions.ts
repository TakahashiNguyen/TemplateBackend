import { ErrorAction, ErrorObject, ErrorType } from '.';

/**
 * Get server exception message base on input context.
 *
 * @example
 *
 * ```ts
 * serverException('Invalid', 'Client', 'Request');
 * ```
 *
 * @param {ErrorType} type - The type of error (e.g., 'Database', 'Network').
 * @param {ErrorObject} object - The object related to the error (e.g.,
 *   'Connection', 'Request').
 * @param {ErrorAction} action - The action that caused the error (e.g.,
 *   'Failed', 'Timeout').
 * @returns {string} Server exception message.
 */
export function serverException(
	type: ErrorType,
	object: ErrorObject,
	action: ErrorAction,
): string {
	return type + '_' + object + (action ? '_' : '') + action;
}
