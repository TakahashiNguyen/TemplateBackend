import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Column } from 'typeorm';
import { AmbiguousReturn } from 'utils/app/types';

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
}
