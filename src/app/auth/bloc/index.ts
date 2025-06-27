import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'app';

import { Bloc } from './bloc.entity';
import { BlocService } from './bloc.service';

/** Bloc module class. */
@Module({
	imports: [TypeOrmModule.forFeature([Bloc]), forwardRef(() => AppModule)],
	providers: [BlocService],
	exports: [BlocService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class BlocModule {}
