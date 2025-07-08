import { IAuthentication } from 'app/auth/interfaces';
import { Omitting, Subtract } from 'utils/app/types';
import { BaseEntity } from 'utils/typeorm/classes';

import { User } from './user.entity';

/** User login dto. */
export class UserLogin implements Pick<User, 'authentication' | 'email'> {
	/** User's email. */
	email!: string;

	/** User authencation. */
	authentication!: IAuthentication;
}

/** User sign up dto. */
export class UserSignup
	implements
		Omitting<Subtract<User, BaseEntity>, 'role' | 'files' | 'avatarPath'>
{
	/** User authencation. */
	authentication!: IAuthentication;

	/** User's email. */
	email!: string;

	/** User's name. */
	name!: string;
}

/** Change password dto. */
export class ChangePasswordDto implements Pick<User, 'email'> {
	/** User's email. */
	email!: string;
}
