import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ModifiedCacheInterceptor } from 'utils/app/class';
import { databaseType } from 'utils/app/constants';
import { DateTimeScalar } from 'utils/graphql/classes';

import { cacheModule } from './cache';
import { configModule } from './config';
import { graphqlModule } from './graphql';
import { typeOrmModule } from './typeorm';

/** Base module. */
@Module({
	imports: [
		JwtModule.register({ global: true }),
		cacheModule,
		graphqlModule,
		configModule,
		typeOrmModule(databaseType),
	],
	providers: [
		{ provide: APP_INTERCEPTOR, useClass: ModifiedCacheInterceptor },
		DateTimeScalar,
	],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BaseModule {}
