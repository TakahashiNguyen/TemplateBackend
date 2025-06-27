import { Controller, Get } from '@nestjs/common';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	MemoryHealthIndicator,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { join } from 'node:path';

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
