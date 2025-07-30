import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { BlocService } from './auth/bloc/bloc.service';
import { HookService } from './auth/hook/hook.service';
import { FileService } from './file/file.service';
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
	 * @param {BlocService} bloc - Bloc service.
	 * @param {FileService} file - File service.
	 * @param {HookService} hook - Hook service.
	 */
	constructor(
		@Inject(forwardRef(() => UserService)) public user: UserService,
		@Inject(forwardRef(() => MailService)) public mail: MailService,
		@Inject(forwardRef(() => BlocService)) public bloc: BlocService,
		@Inject(forwardRef(() => FileService)) public file: FileService,
		@Inject(forwardRef(() => HookService)) public hook: HookService,
	) {}
}
