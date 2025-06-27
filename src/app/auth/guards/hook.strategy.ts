import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ITokens } from 'utils/auth/interfaces';
import { ServerException } from 'utils/error';

import { Hook } from '../hook/hook.entity';
import { HookService } from '../hook/hook.service';

/** Check the hook is valid. */
@Injectable()
export class HookStrategy extends PassportStrategy(Strategy, 'hook') {
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
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.getOrThrow('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
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
		if (accessToken == null)
			throw new ServerException('Invalid', 'User', 'Request');

		return this.hook.id(accessToken);
	}
}
