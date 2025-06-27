import { IBaseAuthentication } from 'app/auth/classes';
import { IsStrongPassword } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column } from 'typeorm';
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
	@IsStrongPassword({
		minLength: 16,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	private password?: string;

	/**
	 * Initiatialize password class.
	 *
	 * @param args
	 * @param args.hashedPassword
	 * @param args.password
	 */
	constructor(args: {
		/** Hashed password. */ hashedPassword?: string;
		/** Plain password. */ password?: string;
	}) {
		this.password = args.password;
		this.hashedPassword = args.hashedPassword;
	}

	/**
	 * Hashing password function.
	 *
	 * @example
	 *
	 * ```ts
	 * this.hashingPassword();
	 * ```
	 */
	@BeforeInsert()
	@BeforeUpdate()
	private async hashingPassword() {
		if (this.password == null)
			throw new ServerException('Fatal', 'Server', 'Implementation');

		this.hashedPassword = await bidirectionalHash(this.password, {
			parallelism: 3 + (3).random,
			memoryCost: 60000 + (6000).random,
			timeCost: 3 + (3).random,
			hashLength: 60 + (60).random,
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
}
