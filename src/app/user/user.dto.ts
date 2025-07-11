import { Authentication } from 'app/auth/classes';
import { IAuthentication } from 'app/auth/interfaces';
import { IsDefined } from 'class-validator';
import { Omitting, Subtract } from 'utils/app/types';
import { BaseEntity } from 'utils/typeorm/classes';

import { User } from './user.entity';

/** User login dto. */
export class UserLogin implements Pick<User, 'authentication' | 'email'> {
	/** User's email. */
	@IsDefined()
	email!: string;

	/** User authentication. */
	@IsDefined()
	authentication!: IAuthentication;
}

/** User sign up dto. */
export class UserSignupDto
	implements
		Omitting<Subtract<User, BaseEntity>, 'role' | 'files' | 'avatarPath'>
{
	/** User authentication. */
	@IsDefined()
	authentication!: Authentication;

	/** User's email. */
	@IsDefined()
	email!: string;

	/** User's name. */
	@IsDefined()
	name!: string;

	/** Client's hostname visit url. */
	@IsDefined()
	urlVisit!: string;

	/** Client's hostname notification management url. */
	@IsDefined()
	urlManageNotifications!: string;
}

/** Change password dto. */
export class RequestModifyingAuthenticationDto implements Pick<User, 'email'> {
	/** User's email. */
	@IsDefined()
	email!: string;

	/** Client's url to modifying authentication. */
	@IsDefined()
	urlModifyingAuthentication!: string;
}
