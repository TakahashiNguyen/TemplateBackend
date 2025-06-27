import { Module } from '@nestjs/common';
import { AppModule } from 'app';
import { databaseType } from 'utils/app/constants';

import { cacheModule } from './cache';
import { configModule } from './config';
import { graphqlModule } from './graphql';
import { typeOrmModule } from './typeorm';

/** Module collection. */
@Module({
	imports: [
		configModule,
		cacheModule,
		graphqlModule,
		typeOrmModule(databaseType),
		AppModule,
	],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class {}
