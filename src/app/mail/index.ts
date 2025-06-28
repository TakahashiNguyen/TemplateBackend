import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'node:path';

import { MailService } from './mail.service';

/** Mailing module. */
@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService): MailerOptions => {
				return {
					transport: process.argv.some((i) => i == '--test-email')
						? { secure: false, host: 'localhost', port: 7777 }
						: {
								host: config.getOrThrow('SMTP_HOST'),
								secure: true,
								auth: {
									user: config.getOrThrow('SMTP_USER'),
									pass: config.getOrThrow('SMTP_PASS'),
								},
							},
					template: {
						dir: join(process.cwd(), '../app/mail/templates'),
						adapter: new HandlebarsAdapter(),
						options: { strict: true },
					},
				};
			},
		}),
	],
	providers: [MailService],
	exports: [MailService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MailModule {}
