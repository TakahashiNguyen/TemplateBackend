import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

/** Mail service. */
@Injectable()
export class MailService {
	/**
	 * Initiate mail service.
	 *
	 * @param {MailerService} mailerService - Mailer service.
	 */
	constructor(
		@Inject(forwardRef(() => MailerService))
		private mailerService: MailerService,
	) {}

	/**
	 * Sending email with context.
	 *
	 * @example
	 *
	 * ```ts
	 * this.send(foo@email.com, 'bar', template, {});
	 * ```
	 *
	 * @param {string} email - Destination email.
	 * @param {string} subject - Email subject.
	 * @param {string} template - The template name.
	 * @param {object} context - Hook's signature.
	 * @returns {Promise<void>}
	 */
	async send(
		email: string,
		subject: string,
		template: string,
		context: object,
	): Promise<void> {
		await this.mailerService.sendMail({
			to: email,
			subject,
			template: `./${template}.html`,
			context,
		});
	}
}
