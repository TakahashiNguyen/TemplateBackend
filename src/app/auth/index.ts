import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { getDefaultExportFromSubdirectory } from 'utils/app/functions';

import { AccessGuard } from './guards/access.guard';
import { AccessStrategy } from './guards/access.strategy';
import { HookGuard } from './guards/hook.guard';
import { HookStrategy } from './guards/hook.strategy';
import { LocalhostGuard } from './guards/localhost.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { RefreshStrategy } from './guards/refresh.strategy';

const modules = getDefaultExportFromSubdirectory(__dirname);

/** Authentication module. */
@Module({
	imports: [
		// Authentication
		PassportModule.register({ session: true }),
		// Modules
		...modules,
	],
	providers: [
		// Strategies
		AccessStrategy,
		RefreshStrategy,
		HookStrategy,
		// Guards
		AccessGuard,
		RefreshGuard,
		HookGuard,
		LocalhostGuard,
	],
	exports: modules,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class AuthenticationModule {}
