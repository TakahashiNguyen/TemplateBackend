import { h64 } from 'xxhashjs';

/**
 * Generates a hash for the given string using xxHash64.
 * @param {string} str - The string to hash.
 * @returns {string} The resulting hash as a hexadecimal string.
 * @example
 * const hash = hashing('example string');
 * console.log(hash); // Outputs a hash different from the input string
 */
export function hashing(str: string): string {
	return h64(str, 0xcafe).toString();
}
