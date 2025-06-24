import { hash as argon2Hash, verify } from 'argon2';

import { ModifiedArgon2Options } from './types';

/**
 * The function generated a hash from `input` that verifiable.
 *
 * @example BidirectionalHash('Hello, world!', {parallelism: 1, memoryCost: 16,
 * timeCost: 2, hashLength: 16})
 *
 * @param {string} input - The string is going to be hashed.
 * @param {ModifiedArgon2Options} option - Customize function arguments for
 *   different outcomes.
 * @returns {Promise<string>} Verifiable hashed string from `input`.
 */
export async function bidirectionalHash(
	input: string,
	option: ModifiedArgon2Options,
): Promise<string> {
	return argon2Hash(input, option);
}

/**
 * The function verifies if `input` matches the hash generated `origin`.
 *
 * @example
 * VerifyBidirectionalHash('$argon2id$v=19$m=16,t=2,p=1$Zm9vYmFyZm9vYmFy$Jehr9E7oAOOrp8speaahJA',
 * 'Hello, world!') // true.
 *
 * @param {string} origin - The string verifies the `input` string.
 * @param {string} input - The string to verify if it matches `original`.
 * @returns {Promise<boolean>} Positive value if `input` validated with `origin`
 *   and vice versa.
 */
export async function verifyBidirectionalHash(
	origin: string,
	input: string,
): Promise<boolean> {
	try {
		return await verify(input, origin);
	} catch {
		return false;
	}
}
