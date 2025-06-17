import { Module } from '@nestjs/common';

import { cacheModule } from './cache';
import { configModule } from './config';
import { typeOrmModule } from './typeorm';

@Module({
	imports: [configModule, typeOrmModule('postgres'), cacheModule],
})
export class MainModule {}
