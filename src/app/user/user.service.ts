import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerException } from 'utils/error/classes';
import { serverException } from 'utils/error/functions';
import { DatabaseRequests } from 'utils/typeorm/classes';

import { User } from './user.entity';

/** User service class. */
@Injectable()
export class UserService extends DatabaseRequests<typeof User> {
	/**
	 * Initiate user service.
	 *
	 * @param {Repository<User>} repo - Entity repo.
	 */
	constructor(@InjectRepository(User) repo: Repository<User>) {
		super(repo, User);
	}

	/**
	 * Find user with email.
	 *
	 * @example
	 *
	 * ```ts
	 * this.email(input);
	 * ```
	 *
	 * @param {string} input - User's email.
	 * @returns {Promise<User>} Found user by email.
	 */
	async email(input: string): Promise<User> {
		const user = await this.findOne({ cache: false, email: input.lower });

		if (!user) throw new ServerException('Invalid', 'Email', 'Submit');

		return user;
	}

	/**
	 * Resolving user email or throwing errors if email existed.
	 *
	 * @example
	 *
	 * ```ts
	 * this.resolveEmailOrThrow(email);
	 * ```
	 *
	 * @param {string | undefined} input - User email to resolve.
	 * @returns {Promise<string>} Resolved user email.
	 */
	private async resolveEmailIfExisted(
		input: string | undefined,
	): Promise<string> {
		const email = input?.lower;

		if (!email) throw new ServerException('Invalid', 'Email', 'Submit');

		try {
			await this.email(email);

			throw new ServerException('Invalid', 'Email', 'Assign');
		} catch (e) {
			const { message } = e as ServerException;

			switch (true) {
				case message.includes(serverException('Invalid', 'Email', 'Submit')):
					break;

				default:
					throw e;
			}
		}

		return email;
	}

	/**
	 * Create a user entity.
	 *
	 * @example
	 *
	 * ```ts
	 * this.create(user);
	 * ```
	 *
	 * @param {Parameters<typeof this.$create>} args - Input arguments.
	 * @returns {Promise<User>} Instance of User.
	 */
	public async create(...args: Parameters<typeof this.$create>): Promise<User> {
		const [input] = args,
			email = await this.resolveEmailIfExisted(input.email);

		return this.$create({ ...input, email });
	}

	/**
	 * Update a user entity.
	 *
	 * @example
	 *
	 * ```ts
	 * this.update({ id }, updatedEntity);
	 * ```
	 *
	 * @param {Parameters<typeof this.$update>} args - Input arguments.
	 * @returns {Promise<void>}
	 */
	public async update(...args: Parameters<typeof this.$update>): Promise<void> {
		const [target, update] = args;

		if (update.email) {
			const email = await this.resolveEmailIfExisted(update.email.toString());

			return this.$update(
				{ ...target, email: target.email?.toString().lower },
				{ ...update, email },
			);
		} else
			return this.$update(
				{ ...target, email: target.email?.toString().lower },
				update,
			);
	}
}
