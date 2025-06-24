import { Module } from '@nestjs/common';

import { cacheModule } from './cache';
import { configModule } from './config';
import { graphqlModule } from './graphql';
import { typeOrmModule } from './typeorm';

/** Module collection. */
@Module({
	imports: [
		configModule,
		typeOrmModule('postgres'),
		cacheModule,
		graphqlModule,
	],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class {}
