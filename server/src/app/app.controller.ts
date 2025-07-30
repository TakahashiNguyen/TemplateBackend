import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	MemoryHealthIndicator,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { FastifyReply } from 'fastify';
import { join } from 'node:path';
import { UserReceiveDto } from 'utils/app/dto';
import { ServerException } from 'utils/error/classes';
import { serverException } from 'utils/error/functions';

import { Bloc } from './auth/bloc/bloc.entity';
import { BlocService } from './auth/bloc/bloc.service';
import { GetRequest, type IMetadata } from './auth/guards';
import { RefreshGuard } from './auth/guards/refresh.guard';

/** Server health controller. */
@Controller('health')
export class HealthController {
	/**
	 * Initialize health controller.
	 *
	 * @param {HealthCheckService} health - Health check service.
	 * @param {TypeOrmHealthIndicator} db - Database check service.
	 * @param {DiskHealthIndicator} disk - Disk check service.
	 * @param {MemoryHealthIndicator} memory - Memory check service.
	 */
	constructor(
		private readonly health: HealthCheckService,
		private readonly db: TypeOrmHealthIndicator,
		private readonly disk: DiskHealthIndicator,
		private readonly memory: MemoryHealthIndicator,
	) {}

	/**
	 * Server check by RestAPI.
	 *
	 * @example
	 *
	 * ```ts
	 * this.check();
	 * ```
	 *
	 * @returns {Promise<HealthCheckResult>} The result of server health check.
	 */
	@Get() @HealthCheck() check(): Promise<HealthCheckResult> {
		return this.health.check([
			() => this.db.pingCheck('database'),
			() =>
				this.disk.checkStorage('storage', {
					path: join(process.cwd()),
					thresholdPercent: 0.75,
				}),
			() => this.memory.checkHeap('memory_heap', (256).mb2b),
			() => this.memory.checkRSS('memory_rss', (400).mb2b),
		]);
	}
}

/** App controller class. */
@Controller({ path: '' })
export class AppController {
	/**
	 * Initiate controller.
	 *
	 * @param {BlocService} bloc - Bloc service.
	 */
	constructor(private bloc: BlocService) {}

	/**
	 * Refreshing tokens request.
	 *
	 * @example
	 *
	 * ```ts
	 * this.refresh(metadata, bloc);
	 * ```
	 *
	 * @param {IMetadata} metadata - Client's metadata.
	 * @param {Bloc} bloc - Received bloc from postprocessing.
	 * @returns {Promise<UserReceiveDto>} An user receive class.
	 */
	@ApiSecurity('CsrfToken')
	@Post('refresh')
	@UseGuards(RefreshGuard)
	async refresh(
		@GetRequest('metadata') metadata: IMetadata,
		@GetRequest('bloc') bloc: Bloc,
	): Promise<UserReceiveDto> {
		if (!bloc) throw new ServerException('Invalid', 'Client', 'Request');

		let isSuccess = false;

		if (!(isSuccess = bloc.metadata.verify(metadata)))
			await this.bloc.removeTree({ id: bloc.id });

		return new UserReceiveDto({
			message: isSuccess
				? serverException('Success', 'Client', 'Request')
				: serverException('Invalid', 'Client', 'Submit'),
		});
	}

	/**
	 * Get csrf token function.
	 *
	 * @example
	 *
	 * ```ts
	 * this.csrfToken(res);
	 * ```
	 *
	 * @param {FastifyReply} res - Server response interface.
	 * @returns {UserReceiveDto} An user receive class.
	 */
	@Get('csrf-token')
	async csrfToken(
		@Res({ passthrough: true }) res: FastifyReply,
	): Promise<UserReceiveDto> {
		return new UserReceiveDto({
			token: res.generateCsrf(),
			message: serverException('Success', 'Token', 'Request'),
		});
	}
}
