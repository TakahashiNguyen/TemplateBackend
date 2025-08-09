import { IBaseAuthentication } from 'app/auth/classes';
import { IsOptional, IsStrongPassword } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column } from 'typeorm';
import { AttributesOnly } from 'utils/app/types';
import {
	bidirectionalHash,
	verifyBidirectionalHash,
} from 'utils/auth/functions';
import { ServerException } from 'utils/error/classes';

/** Password class. */
export class Password implements IBaseAuthentication {
	/** Hashed password. */
	@Column({ nullable: false }) private hashed?: string;

	/** Plain password. */
	@IsOptional()
	@IsStrongPassword({
		minLength: 16,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	value: string;

	/**
	 * Initialize password class.
	 *
	 * @param {AttributesOnly<Password>} object - Input Password class fields.
	 */
	constructor(object: AttributesOnly<Password>) {
		this.value = object?.value;

		// @ts-expect-error private field
		this.hashed = object?.hashed;
	}

	// Methods

	/**
	 * Hashing password function.
	 *
	 * @example
	 *
	 * ```ts
	 * this.hashingPassword();
	 * ```
	 *
	 * @throws {ServerException} If instance's password field empty.
	 */
	@BeforeInsert()
	@BeforeUpdate()
	private hashingPassword() {
		if (this.value != null)
			this.hashed = bidirectionalHash(this.value, {
				parallelism: 3 + (3).random,
				memoryCost: 60000 + (6000).random,
				timeCost: 3 + (3).random,
				outputLen: 32 + (32).random,
			});
	}

	/**
	 * Authenticate `password` if it matches with `hashedPassword`.
	 *
	 * @example
	 *
	 * ```ts
	 * const isValid = this.authenticate({ password: 'foo' });
	 * ```
	 *
	 * @param {string} password - Input password.
	 * @returns {boolean} True if password is matched with hashed password and
	 *   vice versa.
	 * @throws {ServerException} Will throw an error if `hashed` is null or empty.
	 */
	authenticate(password: string): boolean {
		if (this.hashed == null)
			throw new ServerException('Fatal', 'Server', 'Implementation');

		return verifyBidirectionalHash(this.hashed, password);
	}

	/**
	 * Testing function.
	 *
	 * @example
	 *
	 * ```ts
	 * Password.test();
	 * ```
	 *
	 * @param {ConstructorParameters<typeof Password>[0]} [obj] - Input for
	 *   password class.
	 * @returns {ConstructorParameters<typeof Password>[0]} An input for password
	 *   class.
	 */
	static test(
		obj?: ConstructorParameters<typeof Password>[0],
	): ConstructorParameters<typeof Password>[0] {
		return {
			value: obj?.value || (16).string + 'aA1!',
		};
	}
}
