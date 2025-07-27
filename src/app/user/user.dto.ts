import { Field, InputType } from '@nestjs/graphql';
import { Authentication } from 'app/auth/classes';
import { type IAuthentication } from 'app/auth/interfaces';
import { IsDefined, IsEmail, IsNumberString, IsUrl } from 'class-validator';
import { type DeepAttributesOnly, Omitting, Subtract } from 'utils/app/types';
import { BaseEntity } from 'utils/typeorm/classes';

import { User } from './user.entity';
import { UserRole } from './user.model';

/** User login dto. */
export class UserLoginDto
	implements DeepAttributesOnly<Pick<User, 'authentication' | 'email'>>
{
	/** User's email. */
	@IsDefined()
	@IsEmail()
	email!: string;

	/** User authentication. */
	@IsDefined()
	authentication!: IAuthentication;
}

/** User sign up dto. */
export class UserSignupDto
	implements
		DeepAttributesOnly<
			Omitting<Subtract<User, BaseEntity>, 'role' | 'files' | 'avatarPath'>
		>
{
	/** User authentication. */
	@IsDefined()
	authentication!: DeepAttributesOnly<Authentication>;

	/** User's phone number. */
	@IsDefined()
	@IsNumberString()
	phone!: string;

	/** User's email. */
	@IsDefined()
	@IsEmail()
	email!: string;

	/** User's name. */
	@IsDefined()
	name!: string;

	/** Client's hostname visit url. */
	@IsDefined()
	@IsUrl()
	urlVisit!: string;

	/** Client's hostname notification management url. */
	@IsDefined()
	@IsUrl()
	urlManageNotifications!: string;
}

/** Change password dto. */
export class RequestModifyingAuthenticationDto implements Pick<User, 'email'> {
	/** User's email. */
	@IsDefined()
	@IsEmail()
	email!: string;

	/** Client's url to modifying authentication. */
	@IsDefined()
	@IsUrl()
	urlModifyingAuthentication!: string;
}

/** Find user dto. */
@InputType()
export class UserFind
	implements
		DeepAttributesOnly<
			Omitting<User, 'authentication' | 'createdAt' | 'updatedAt'>
		>
{
	/** User's email. */
	@Field({ nullable: true }) email!: string;
	/** User's phone number. */
	@Field({ nullable: true }) phone!: string;
	/** User's role. */
	@Field({ nullable: true }) role!: UserRole;
	/** User's avatar path. */
	@Field({ nullable: true }) avatarPath!: string;
	/** User's identifier. */
	@Field({ nullable: true }) id!: string;
	/** User's name. */
	@Field({ nullable: true }) name!: string;
}
