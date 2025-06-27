import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'app/user/user.entity';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'utils/typeorm/classes';

import { IMetadata } from '../guards';
import { Hook } from './hook.entity';

/** Hook service. */
@Injectable()
export class HookService extends DatabaseRequests<Hook> {
	/**
	 * Initiate hook service.
	 *
	 * @param {Repository<Hook>} repo - Entity repo.
	 */
	constructor(@InjectRepository(Hook) repo: Repository<Hook>) {
		super(repo, Hook);
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
	 * @param {Hook} hook - Recieved hook from client.
	 * @param {IMetadata} metadata - Client's metadata.
	 * @param {string} signature - Client hook's signature.
	 */
	async validating(hook: Hook, metadata: IMetadata, signature: string) {
		await this.delete(hook.id);

		hook.verify(metadata, signature);
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
	 * @param {Function} func - The method to recieve signature and return base
	 *   user.
	 * @param {object} note - Additional infomation to store.
	 * @returns {Promise<Hook>} Instance of created Hook.
	 */
	async create(
		metadata: IMetadata,
		func: (signature: string) => Promise<User> | User,
		note?: object,
	): Promise<Hook> {
		const signature = (128).string,
			owner = await func(signature),
			hook = new Hook({ owner, signature, note });

		hook.metadata.set = metadata;

		return this.$create(hook);
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
}
