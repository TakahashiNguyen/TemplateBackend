import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IServerKey, ITokens } from 'utils/auth/interfaces';
import { ServerException } from 'utils/error';

import { BlocService } from '../bloc/bloc.service';

/** Check the access token from client. */
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
	/**
	 * Initiate access strategy.
	 *
	 * @param {ConfigService} config - Server config service.
	 * @param {BlocService} bloc - Bloc service.
	 */
	constructor(
		config: ConfigService,
		private bloc: BlocService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.getOrThrow('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}

	/**
	 * Validating the access token from client.
	 *
	 * @example
	 *
	 * ```ts
	 * this.validate({ accessToken });
	 * ```
	 *
	 * @param {ITokens} payload - The payload from token.
	 * @returns {Promise<IServerKey>} Server key is going to save in request
	 *   context.
	 */
	async validate({ accessToken }: ITokens): Promise<IServerKey> {
		if (accessToken == null)
			throw new ServerException('Invalid', 'Client', 'Request');

		const { owner } = await this.bloc.findBlocByHash(accessToken);
		await this.bloc.issue({ currentHash: accessToken });

		return { user: owner };
	}
}
