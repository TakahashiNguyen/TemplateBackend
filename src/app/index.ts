import { Module, forwardRef } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { HealthController } from './app.controller';

const modules = readdirSync(__dirname, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	.map((i) => require(join(i.parentPath, i.name)).default);

/** Collection of app modules. */
@Module({
	imports: [
		TerminusModule.forRoot({
			gracefulShutdownTimeoutMs: (30).s2ms,
			logger: false,
		}),
		...modules.map((i) => forwardRef(() => i)),
	],
	controllers: [HealthController],
	exports: [...modules],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
