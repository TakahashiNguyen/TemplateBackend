import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { hashSync as argon2Hash, verifySync } from '@node-rs/argon2';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AbstractConstructor } from 'utils/app/types';

import { ModifiedArgon2Options } from './types';

/**
 * The function generated a hash from `input` that verifiable.
 *
 * @example
 *
 * ```ts
 * bidirectionalHash('Hello, world!', {
 * 	parallelism: 1,
 * 	memoryCost: 16,
 * 	timeCost: 2,
 * 	hashLength: 16,
 * });
 * ```
 *
 * @param {string} input - The string is going to be hashed.
 * @param {ModifiedArgon2Options} option - Customize function arguments for
 *   different outcomes.
 * @returns {Promise<string>} Verifiable hashed string from `input`.
 */
export function bidirectionalHash(
	input: string,
	option: ModifiedArgon2Options,
): string {
	return argon2Hash(input, option);
}

/**
 * The function verifies if `input` matches the hash generated `origin`.
 *
 * @example
 *
 * ```ts
 * verifyBidirectionalHash(
 * 	'$argon2id$v=19$m=16,t=2,p=1$Zm9vYmFyZm9vYmFy$Jehr9E7oAOOrp8speaahJA',
 * 	'Hello, world!',
 * ); // true
 * ```
 *
 * @param {string} origin - The string verifies the `input` string.
 * @param {string} input - The string to verify if it matches `original`.
 * @returns {boolean} Positive value if `input` validated with `origin` and vice
 *   versa.
 */
export function verifyBidirectionalHash(
	origin: string,
	input: string,
): boolean {
	return verifySync(origin, input);
}

/**
 * Check if `required` has a value equal to `input`.
 *
 * @example
 *
 * ```ts
 * const valid = roleMatching('foo', ['foo', 'bar']); // true
 * ```
 *
 * @template T
 * @param {T} input - Input role.
 * @param {T[]} required - Check roles.
 * @returns {boolean} True if `input` is in `required`.
 */
export function roleMatching<T>(input: T, required: T[]): boolean {
	return required.some((i) => i === input);
}

/**
 * Token guard class.
 *
 * @example
 *
 * ```ts
 * TokenGuard('access', 'access');
 * ```
 *
 * @param {'access' | 'refresh'} type - Token type.
 * @param {string} name - Guard name.
 * @returns {AbstractConstructor<
 * 	ReturnType<typeof PassportStrategy.prototype>
 * >}
 *   An abstract token guard class.
 */
export function TokenGuard(
	type: 'access' | 'refresh',
	name: string,
): AbstractConstructor<ReturnType<typeof PassportStrategy.prototype>> & {
	/** Header name. */
	header: string;
} {
	/** Token guard class. */
	abstract class TokenGuard extends PassportStrategy(Strategy, name) {
		/** Request header authentication. */
		static readonly header: string = type;

		/**
		 * Initiate token guard strategy.
		 *
		 * @param {ConfigService} config - Server config service.
		 */
		constructor(config: ConfigService) {
			super({
				jwtFromRequest: ExtractJwt.fromHeader(TokenGuard.header),
				secretOrKey: config.getOrThrow(type.toUpperCase() + '_SECRET'),
				ignoreExpiration: false,
			});
		}
	}

	return TokenGuard;
}
