import { Module, forwardRef } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { getDefaultExportFromSubdirectory } from 'utils/app/functions';

import { HealthController } from './app.controller';

const modules = getDefaultExportFromSubdirectory(__dirname);

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
