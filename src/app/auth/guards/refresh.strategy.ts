import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenGuard } from 'utils/auth/functions';
import { ITokens } from 'utils/auth/interfaces';
import { ServerException } from 'utils/error/classes';

import { Bloc } from '../bloc/bloc.entity';
import { BlocService } from '../bloc/bloc.service';

/** Check the refresh token from client. */
@Injectable()
export class RefreshStrategy extends RefreshTokenGuard('refresh') {
	/**
	 * Initiate refresh strategy.
	 *
	 * @param {ConfigService} config - Config service.
	 * @param {BlocService} bloc - Bloc service.
	 */
	constructor(
		config: ConfigService,
		private bloc: BlocService,
	) {
		super(config);
	}

	/**
	 * Validating the refresh token.
	 *
	 * @example
	 *
	 * ```ts
	 * this.validate({ refreshToken });
	 * ```
	 *
	 * @param {ITokens} payload - The payload from token.
	 * @returns {Promise<Bloc>} Retrieved bloc from token.
	 */
	async validate({ refreshToken }: ITokens): Promise<Bloc> {
		if (refreshToken == null)
			throw new ServerException('Invalid', 'Client', 'Request');

		const current = await this.bloc.id(refreshToken);

		if (current == undefined)
			throw new ServerException('Invalid', 'Client', 'Request');

		if (
			(await this.bloc.findContinuousBloc(current.currentHash)) != undefined
		) {
			await this.bloc.removeTree({ id: current.id });
			throw new ServerException('Invalid', 'User', 'Access');
		}

		return this.bloc.create({
			currentHash: current.currentHash,
			owner: current.owner,
		});
	}
}
