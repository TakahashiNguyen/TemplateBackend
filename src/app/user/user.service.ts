import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'utils/typeorm/classes';

import { User } from './user.entity';

/** User service class. */
@Injectable()
export class UserService extends DatabaseRequests<User> {
	/**
	 * Initiate user service.
	 *
	 * @param {Repository<User>} repo - Entity repo.
	 */
	constructor(@InjectRepository(User) repo: Repository<User>) {
		super(repo, User);
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
	public create(...args: Parameters<typeof this.$create>): Promise<User> {
		return this.$create(...args);
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
	public update(...args: Parameters<typeof this.$update>): Promise<void> {
		return this.$update(...args);
	}
}
