import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'app';

import { Hook } from './hook.entity';
import { HookService } from './hook.service';

/** Hook module class. */
@Module({
	imports: [TypeOrmModule.forFeature([Hook]), forwardRef(() => AppModule)],
	providers: [HookService],
	exports: [HookService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class HookModule {}
