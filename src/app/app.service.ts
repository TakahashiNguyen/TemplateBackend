import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { MailService } from './mail/mail.service';
import { UserService } from './user/user.service';

/** Collection of app services. */
@Injectable()
export class AppService {
	/**
	 * Initialize service.
	 *
	 * @param {UserService} user - User service.
	 * @param {MailService} mail - Mail service.
	 */
	constructor(
		@Inject(forwardRef(() => UserService)) public user: UserService,
		@Inject(forwardRef(() => MailService)) public mail: MailService,
	) {}
}
