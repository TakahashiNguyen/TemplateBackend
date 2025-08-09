import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Allow, GetRequest } from 'app/auth/guards';
import { UserGuard } from 'app/auth/guards/user.guard';
import { Hook } from 'app/auth/hook/hook.entity';
import { Paging } from 'utils/app/dto';
import { paginateResponse } from 'utils/app/functions';
import { IPaginateResult } from 'utils/app/interfaces';

import { PaginatedUser, UserFind } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

/** User resolver class. */
@Resolver(() => User)
@UseGuards(UserGuard)
export class UserResolver {
	/**
	 * Initiate user resolver.
	 *
	 * @param {UserService} user - User service.
	 */
	constructor(private user: UserService) {}

	// Queries

	/**
	 * Query user by request.
	 *
	 * @example
	 *
	 * ```ts
	 * this.getUsers(input, paging);
	 * ```
	 *
	 * @param {UserFind} input - Input to find user.
	 * @param root0
	 * @param root0.index
	 * @param root0.take
	 * @returns {Promise<IPaginateResult<User>>} Processed result.
	 */
	@Query(() => PaginatedUser) @Allow([]) async getUsers(
		@Args('input') input: UserFind,
		@Args('page', { nullable: true }) { index, take }: Paging = new Paging(),
	): Promise<IPaginateResult<User>> {
		return paginateResponse(this.user, input, { take, index });
	}

	/**
	 * Get current user.
	 *
	 * @example
	 *
	 * ```ts
	 * this.me(hook);
	 * ```
	 *
	 * @param root0
	 * @param root0.owner
	 * @returns {User} Received current user.
	 */
	@Query(() => User) @Allow([]) me(@GetRequest('bloc') { owner }: Hook): User {
		return owner;
	}
}
