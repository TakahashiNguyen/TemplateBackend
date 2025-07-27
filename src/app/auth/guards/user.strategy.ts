import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from 'utils/auth/functions';
import { ITokens } from 'utils/auth/interfaces';
import { ServerException } from 'utils/error/classes';

import { Bloc } from '../bloc/bloc.entity';
import { BlocService } from '../bloc/bloc.service';

/** Check user from client. */
@Injectable()
export class UserStrategy extends AccessTokenGuard('user') {
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
		super(config);
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
	 * @returns {Promise<Bloc>} Retrieved bloc from request.
	 */
	async validate({ accessToken }: ITokens): Promise<Bloc> {
		if (accessToken == null)
			throw new ServerException('Invalid', 'Client', 'Request');

		let bloc: Bloc | null;

		bloc = await this.bloc.currentHash(accessToken);

		if (bloc == undefined)
			throw new ServerException('Invalid', 'Client', 'Request');

		await this.bloc.issue({ currentHash: accessToken });

		bloc = await this.bloc.id(bloc.id);

		if (bloc == undefined)
			throw new ServerException('Fatal', 'Server', 'Implementation');

		return bloc;
	}
}
