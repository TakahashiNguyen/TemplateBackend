import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Column } from 'typeorm';
import { AmbiguousReturn, ClassType } from 'utils/app/types';

import { Password } from './api/password';

/** Basic authentication class. */
export abstract class IBaseAuthentication {
	/**
	 * Authenticate function.
	 *
	 * @param {unknown[]} args - Customizable function parameters.
	 */
	abstract authenticate(...args: unknown[]): AmbiguousReturn<boolean>;
}

/** Authentication class. */
export class Authentication {
	/** Password method. */
	@ValidateNested()
	@Type(() => Password)
	@Column(() => Password)
	password: Password;

	/**
	 * Initialize authentication class.
	 *
	 * @param {{ password: ClassType<typeof Password> }} object - Input
	 *   authentication class fields.
	 */
	constructor(
		object: {
			/** Password class input. */ password: ClassType<typeof Password>;
		} & {},
	) {
		this.password = new Password(object?.password);
	}

	// Methods

	/**
	 * Testing function.
	 *
	 * @example
	 *
	 * ```ts
	 * Authentication.test({});
	 * ```
	 *
	 * @param inputs
	 * @param inputs.password
	 * @returns {Authentication} An authentication instance.
	 */
	static test(inputs: {
		/** Input for password field. */
		password?: ConstructorParameters<typeof Password>[0];
	}): ConstructorParameters<typeof Authentication>[0] {
		return { password: Password.test(inputs.password) };
	}
}
