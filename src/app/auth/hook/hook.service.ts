import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'app/user/user.entity';
import { Repository } from 'typeorm';
import { AmbiguousReturn } from 'utils/app/types';
import { DatabaseRequests } from 'utils/typeorm/classes';

import { IMetadata } from '../guards';
import { Hook } from './hook.entity';

/** Hook service. */
@Injectable()
export class HookService extends DatabaseRequests<typeof Hook> {
	/**
	 * Initiate hook service.
	 *
	 * @param {Repository<Hook>} repo - Entity repo.
	 */
	constructor(@InjectRepository(Hook) repo: Repository<Hook>) {
		super(repo, Hook);
	}

	/**
	 * Create Hook.
	 *
	 * @example
	 *
	 * ```ts
	 * this.create(metadata, (signature) => new User());
	 * ```
	 *
	 * @param {IMetadata} metadata - Client's metadata.
	 * @param {Function} func - The method to receive signature and return base
	 *   user.
	 * @param {object} note - Additional information to store.
	 * @returns {Promise<Hook>} Instance of created Hook.
	 */
	async create(
		metadata: IMetadata,
		func: (signature: string) => AmbiguousReturn<User>,
		note?: object,
	): Promise<Hook> {
		const signature = (128).string,
			owner = await func(signature);

		return this.$create({
			owner,
			signature,
			note,
			metadata,
		});
	}

	/**
	 * Updating bloc.
	 *
	 * @deprecated Due to disallow update bloc.
	 * @example
	 *
	 * ```ts
	 * this.update();
	 * ```
	 *
	 * @returns {Promise<void>}
	 */
	public update(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * Validating hook.
	 *
	 * @example
	 *
	 * ```ts
	 * this.validating(hook, metadata, signature);
	 * ```
	 *
	 * @param {Hook} hook - Received hook from client.
	 * @param {IMetadata} metadata - Client's metadata.
	 * @param {string} signature - Client hook's signature.
	 */
	async validating(hook: Hook, metadata: IMetadata, signature: string) {
		await this.delete(hook.id);

		hook.verify(metadata, signature);
	}
}
