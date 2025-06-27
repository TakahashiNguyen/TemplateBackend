import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { UserService } from './user/user.service';

/** Collection of app services. */
@Injectable()
export class AppService {
	/**
	 * Initialize service.
	 *
	 * @param {UserService} user - User service.
	 */
	constructor(
		@Inject(forwardRef(() => UserService)) public user: UserService,
	) {}
}
