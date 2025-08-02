import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenGuard } from 'utils/auth/functions';
import { ITokens } from 'utils/auth/interfaces';
import { ServerException } from 'utils/error/classes';

import { Hook } from '../hook/hook.entity';
import { HookService } from '../hook/hook.service';

/** Check the hook is valid. */
@Injectable()
export class HookStrategy extends TokenGuard('access', 'hook') {
	/**
	 * Initiate hook strategy.
	 *
	 * @param {ConfigService} config - Server config service.
	 * @param {HookService} hook - Hook service.
	 */
	constructor(
		config: ConfigService,
		private hook: HookService,
	) {
		super(config);
	}

	/**
	 * Validating the hook.
	 *
	 * @example
	 *
	 * ```ts
	 * this.validate({ accessToken });
	 * ```
	 *
	 * @param {ITokens} payload - The payload from token.
	 * @returns {Promise<Hook>} Hook entity is going to save in request context.
	 */
	async validate({ accessToken }: ITokens): Promise<Hook> {
		let hook;

		if (
			accessToken == null ||
			(hook = await this.hook.id(accessToken)) == undefined
		)
			throw new ServerException('Invalid', 'User', 'Request');

		return hook;
	}
}
