import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from 'app';
import { ServerInitializationClass } from 'utils/app/classes';

import { BaseModule } from './base';

/** Testing module. */
@Global()
@Module({
	imports: [AppModule, BaseModule],
})
export class TestModule extends ServerInitializationClass {
	/**
	 * Test module initialization.
	 *
	 * @param {HttpAdapterHost} httpAdapterHost - Server http adapter.
	 * @param {ConfigService} config - Config service.
	 * @param {JwtService} jwt - JSON web token service.
	 */
	constructor(
		protected httpAdapterHost: HttpAdapterHost,
		protected config: ConfigService,
		protected jwt: JwtService,
	) {
		super(httpAdapterHost, config, jwt);
	}
}
