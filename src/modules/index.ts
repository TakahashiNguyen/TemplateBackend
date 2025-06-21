import { Module } from '@nestjs/common';

import { cacheModule } from './cache';
import { configModule } from './config';
import { graphqlModule } from './graphql';
import { typeOrmModule } from './typeorm';

@Module({
	imports: [
		configModule,
		typeOrmModule('postgres'),
		cacheModule,
		graphqlModule,
	],
})
export default class {}
