import { Module } from '@nestjs/common';
import { LoadEnvModule } from '@backend/config.module';
import { SqlModule } from '@backend/sql.module';

@Module({
	imports: [LoadEnvModule, SqlModule('test')],
})
export class TestModule {}
