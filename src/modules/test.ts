import { MailerService } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AWSRecieve, AWSService } from 'app/aws/aws.service';
import { lookup } from 'mime-types';
import {
	createReadStream,
	createWriteStream,
	statSync,
	writeFileSync,
} from 'node:fs';
import { Readable } from 'stream';
import { ServerInitializationClass } from 'utils/app/class';

/** Testing module. */
@Global()
@Module({
	imports: [],
	providers: [
		{ provide: MailerService, useValue: { sendMail: jest.fn() } },
		{
			provide: AWSService,
			useValue: {
				upload: jest.fn(async (name: string, input: Readable | Buffer) => {
					if (!name.includes('.server.'))
						if (input instanceof Readable) {
							const writableStream = createWriteStream('/dist' + name);
							input.pipe(writableStream);
						} else writeFileSync('/dist' + name, input);
				}),
				download: jest.fn(async (name: string): Promise<AWSRecieve> => {
					const stream = createReadStream('/dist' + name),
						length = statSync('/dist' + name).size;

					return { stream, length, type: lookup(name) as string };
				}),
			},
		},
	],
	exports: [MailerService, AWSService],
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
