import { Field, ObjectType } from '@nestjs/graphql';
import { Authentication } from 'app/auth/classes';
import { File } from 'app/file/file.entity';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import {
	ApplyPartial,
	AttributesOnly,
	ClassType,
	Omitting,
	Subtract,
} from 'utils/app/types';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';
import { EntityParameters } from 'utils/typeorm/types';

import { UserRole } from './user.model';

/** User entity class. */
@ObjectType()
@CacheControl({ maxAge: (10).m2s })
@Entity()
export class User extends BaseEntity {
	/**
	 * Creates an instance of User.
	 *
	 * @param {AttributesOnly<
	 * 	Subtract<
	 * 		ApplyPartial<Omitting<User, 'authentication'>, 'avatarPath'>,
	 * 		BaseEntity
	 * 	>
	 * > & {
	 * 	authentication: ClassType<typeof Authentication>;
	 * } & EntityParameters<typeof BaseEntity>} object
	 *   - Input user fields.
	 */
	constructor(
		object: AttributesOnly<
			Subtract<
				ApplyPartial<Omitting<User, 'authentication'>, 'avatarPath'>,
				BaseEntity
			>
		> & {
			/** Authentication class. */ authentication: ClassType<
				typeof Authentication
			>;
		} & EntityParameters<typeof BaseEntity>,
	) {
		super(object);
		this.name = object?.name;
		this.phone = object?.phone;
		this.email = object?.email;
		this.role = object?.role;
		this.files = object?.files?.map((i) => new File(i));

		// @ts-expect-error nullable field
		this.avatarPath = object?.avatarPath;

		// class
		this.authentication = new Authentication(object?.authentication);
	}

	/** User authentication. */
	@ValidateNested()
	@Type(() => Authentication)
	@Column(() => Authentication)
	authentication: Authentication;

	// Relationships
	/** User's files. */
	@IsOptional()
	@OneToMany(() => File, ($) => $.owner, { onDelete: 'CASCADE' })
	files?: File[];

	// Information

	/** User's email. */
	@Column() email: string;

	/** User's name. */
	@Column() name: string;

	/** User's phone. */
	@Column() phone: string;

	/** User's role. */
	@Field(() => UserRole)
	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.undefined,
	})
	role: UserRole;

	/** User's avatar path. */
	@Column({ nullable: true }) avatarPath: string;

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
	 * @param root.phone
	 * @param root.role
	 * @param root.authentication
	 * @param root.email
	 * @returns {User} Test user.
	 */
	static test(
		unit: string,
		{
			email = (20).string + '@example.com',
			phone = (10).numeric,
			authentication,
			role = UserRole.guest,
		}: Partial<ConstructorParameters<typeof User>[0]>,
	): ConstructorParameters<typeof User>[0] {
		return {
			name: unit + '_' + (5).string,
			email,
			role,
			phone,
			authentication: authentication || Authentication.test({}),
		};
	}
}
