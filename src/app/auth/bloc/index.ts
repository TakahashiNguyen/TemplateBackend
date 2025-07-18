import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bloc } from './bloc.entity';
import { BlocService } from './bloc.service';

/** Bloc module class. */
@Module({
	imports: [TypeOrmModule.forFeature([Bloc])],
	providers: [BlocService],
	exports: [BlocService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class BlocModule {}
