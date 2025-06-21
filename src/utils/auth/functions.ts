import { Options as Argon2Options, hash as argon2Hash, } from 'argon2';

/**
 * Options for Argon2 hashing
 */
export type ModifiedArgon2Options = Required<
	Pick<Argon2Options, 'hashLength' | 'parallelism' | 'timeCost' | 'memoryCost'>
>;

/**
 * Password hash function
 * @param {string} input - The string need to hash
 * @param {Argon2Options} option - the option for hash
 * @return {string} Hashed string
 */
export async function hash(
	input: string,
	option: ModifiedArgon2Options,
): Promise<string> {
	return argon2Hash(input, option);
}
