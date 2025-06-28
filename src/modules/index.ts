import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppModule } from 'app';

import { BaseModule } from './base';

/** Module collection. */
@Module({
	imports: [BaseModule, AppModule, ScheduleModule.forRoot()],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MainModule {}
