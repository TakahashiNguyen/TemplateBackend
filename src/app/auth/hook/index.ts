import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Hook } from './hook.entity';
import { HookService } from './hook.service';

/** Hook module class. */
@Module({
	imports: [TypeOrmModule.forFeature([Hook])],
	providers: [HookService],
	exports: [HookService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class HookModule {}
