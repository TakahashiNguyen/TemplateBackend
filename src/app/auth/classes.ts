import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Column } from 'typeorm';
import { AmbiguousReturn, AttributesOnly } from 'utils/app/types';

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
	password?: Password;

	/**
	 * Initialize authentication class.
	 *
	 * @param {AttributesOnly<Authentication>} object - Input authencation class
	 *   fields.
	 */
	constructor(object: AttributesOnly<Authentication>) {
		// @ts-expect-error error-free expression
		this.password = new Password(object?.password);
	}

	// Methods

	/**
	 * Testing function.
	 *
	 * @example
	 *
	 * ```ts
	 * Authencation.test({});
	 * ```
	 *
	 * @param inputs
	 * @param inputs.password
	 * @returns {Authentication} An authencation instance.
	 */
	static test(inputs: {
		/** Input for password field. */
		password?: Parameters<(typeof Password)['test']>[0];
	}): Authentication {
		return new Authentication({ password: Password.test(inputs.password) });
	}
}
