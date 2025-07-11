import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppModule } from 'app';
import {
	ModifiedThrottlerGuard,
	ServerInitializationClass,
} from 'utils/app/classes';
import { ServerException } from 'utils/error/classes';

import { BaseModule } from './base';

/** Module collection. */
@Module({
	imports: [
		ThrottlerModule.forRoot({
			throttlers: [{ limit: 2, ttl: 1000, name: 'defaultThrottler' }],
			errorMessage: new ServerException('Fatal', 'User', 'Request').toString(),
		}),
		BaseModule,
		AppModule,
		ScheduleModule.forRoot(),
	],
	providers: [{ provide: APP_GUARD, useClass: ModifiedThrottlerGuard }],
})
export default class MainModule extends ServerInitializationClass {}
