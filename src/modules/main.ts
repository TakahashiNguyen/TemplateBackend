import { Module } from '@nestjs/common';
import { configModule } from 'modules/config';

@Module({
	imports: [configModule],
})
export class MainModule {}
