import { h64 } from 'xxhashjs';

/**
 * The function generated a hash from `input`.
 *
 * @example
 *
 * ```ts
 * unidirectionalHash('Hello, world!'); // '3152ec65f921afc0'
 * ```
 *
 * @param {string} input - The string is going to be hashed.
 * @returns {string} Hashed string from `input`.
 */
export function unidirectionalHash(input: string): string {
	return h64(input, 0xcafe).toString();
}
