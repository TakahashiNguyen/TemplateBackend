import { Field, ObjectType } from '@nestjs/graphql';
import { Password } from 'app/auth/api/password';
import { Authentication } from 'app/auth/classes';
import { Column, Entity } from 'typeorm';
import { GetAttributes, Subtract } from 'utils/app/types';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';

import { UserRole } from './user.model';

/** User entity class. */
@ObjectType()
@CacheControl({ maxAge: (10).m2s })
@Entity()
export class User extends BaseEntity {
	/**
	 * Creates an instance of User.
	 *
	 * @param {IUserInformation} object - Input user fields.
	 */
	constructor(object: GetAttributes<Subtract<User, BaseEntity>>) {
		super();
		if (object == undefined) {
			this.name = this.email = '';
			this.role = UserRole.undefined;
			this.authentication = new Authentication();
		} else {
			this.name = object.name;
			this.email = object.email;
			this.role = object.role;
			this.authentication = object.authentication;
		}
	}

	/** User authentication. */
	@Column(() => Authentication)
	authentication: Authentication;

	// Infomations

	/** User's email. */
	@Column() email: string;

	/** User's name. */
	@Column() name: string;

	/** User's role. */
	@Field(() => UserRole)
	@Column({
		type: 'enum',

		enum: UserRole,

		default: UserRole.undefined,
	})
	role: UserRole;

	// Methods

	/**
	 * Testing function to create a User instance with random data.
	 *
	 * @example
	 *
	 * ```test
	 * const testUser = this.test('foo');
	 * ```
	 *
	 * @param {string} unit - The unit its testing from.
	 * @param root
	 * @param root.email
	 * @param root.password
	 * @returns {User} Test user.
	 */
	static test(
		unit: string,
		{
			email = (20).string + '@example.com',
			password = (12).string + 'aA1!',
		}: {
			/** User email. */ email: string;
			/** User password. */ password: string;
		},
	): User {
		const passIns = new Password({ password }),
			user = new User({
				name: unit + (10).string,

				email,

				role: UserRole.undefined,

				authentication: { password: passIns },
			});

		return user;
	}
}
