import { IBaseAuthentication } from 'app/auth/classes';
import { IsOptional, IsStrongPassword } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column } from 'typeorm';
import { AttributesOnly } from 'utils/app/types';
import {
	bidirectionalHash,
	verifyBidirectionalHash,
} from 'utils/auth/functions';
import { ServerException } from 'utils/error';

/** Password class. */
export class Password implements IBaseAuthentication {
	/** Hashed password. */
	@Column({ nullable: false }) private hashedPassword?: string;

	/** Plain password. */
	@IsOptional()
	@IsStrongPassword({
		minLength: 16,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password?: string;

	/**
	 * Initiatialize password class.
	 *
	 * @param {AttributesOnly<Password> & {
	 * 	hashedPassword?: string;
	 * }} [args] -
	 *   Input Password class fields.
	 */
	constructor(
		args?: AttributesOnly<Password> & {
			/** Hashed password. */ hashedPassword?: string;
		},
	) {
		this.password = args?.password;
		this.hashedPassword = args?.hashedPassword;
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
		if (this.password != null)
			this.hashedPassword = bidirectionalHash(this.password, {
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
	 * @returns {Promise<boolean>} True if password is matched with hashed
	 *   password and vice versa.
	 */
	async authenticate(password: string): Promise<boolean> {
		if (this.hashedPassword == null)
			throw new ServerException('Fatal', 'Server', 'Implementation');

		return verifyBidirectionalHash(this.hashedPassword, password);
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
	 * @param {Password} [obj] - Input for password class.
	 * @returns {Password | undefined} A password instance or undefined.
	 */
	static test(obj?: Password): Password | undefined {
		return new Password({
			password: obj?.password || (16).string + 'aA1!',
		});
	}
}
