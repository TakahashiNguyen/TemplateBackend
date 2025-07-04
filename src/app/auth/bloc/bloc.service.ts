import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'app/user/user.entity';
import { Repository } from 'typeorm';
import { currentTime } from 'utils/app/functions';
import { AttributesOnly, RequireOnlyOne } from 'utils/app/types';
import { ServerException } from 'utils/error';
import { DatabaseRequests } from 'utils/typeorm/classes';

import { Bloc } from './bloc.entity';

/** Bloc identifier. */
type IdOrHash = Pick<AttributesOnly<Bloc>, 'id' | 'currentHash'>;

/** Bloc required infomations. */
type BlocInput = Pick<AttributesOnly<Bloc>, 'currentHash' | 'metadata'>;

/** Bloc service class. */
@Injectable()
export class BlocService extends DatabaseRequests<Bloc> {
	/**
	 * Initiate bloc service.
	 *
	 * @param {Repository<Bloc>} repo - Entity repo.
	 */
	constructor(@InjectRepository(Bloc) repo: Repository<Bloc>) {
		super(repo, Bloc);
	}

	/**
	 * Create new bloc.
	 *
	 * @example
	 *
	 * ```ts
	 * this.create(owner, { previousHash });
	 * ```
	 *
	 * @param {User} owner - The owner of bloc id.
	 * @param root0
	 * @param root0.currentHash
	 * @param root0.metadata
	 * @returns {Promise<Bloc>} Bloc instance.
	 */
	async create(
		owner: User,
		{
			currentHash,
			metadata,
		}: RequireOnlyOne<BlocInput, 'metadata' | 'currentHash'>,
	): Promise<Bloc> {
		const previousHash = await (async () => {
			if (!currentHash) return undefined;

			metadata = (await this.currentHash(currentHash))?.metadata || metadata;

			return currentHash;
		})();

		if (!metadata) throw new ServerException('Invalid', 'Client', 'Submit');

		return this.$create({ owner, previousHash, metadata });
	}

	/**
	 * Update Bloc.
	 *
	 * @deprecated Non functional method.
	 * @example
	 *
	 * ```ts
	 * this.update(bloc);
	 * ```
	 *
	 * @param {never} args - Input parameters.
	 * @returns {Promise<void>}
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public update(...args: unknown[]): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * Remove tree by id.
	 *
	 * @example
	 *
	 * ```ts
	 * this.removeTree(blocId);
	 * ```
	 *
	 * @param {RequireOnlyOne<IdOrHash, 'currentHash' | 'id'>} objects - Removing
	 *   tree's sub-bloc id or hash.
	 */
	async removeTree({
		id: targetId,
		currentHash: targetCurrentHash,
	}: RequireOnlyOne<IdOrHash, 'currentHash' | 'id'>) {
		let currentBloc;

		try {
			currentBloc = await this.id(targetId);
		} catch {
			try {
				currentBloc = await this.currentHash(targetCurrentHash);
			} catch {
				throw new ServerException('Invalid', 'Input', 'Submit');
			}
		}

		if (!currentBloc) return;

		await this.delete(currentBloc.id);

		if (currentBloc.previousHash)
			await this.removeTree({ currentHash: currentBloc.previousHash });

		const continuousId = (
			await this.findContinuousBloc(currentBloc.currentHash)
		)?.id;

		if (continuousId) await this.removeTree({ id: continuousId });
	}

	/**
	 * Issuing current bloc.
	 *
	 * @example
	 *
	 * ```ts
	 * this.issue({ id });
	 * ```
	 *
	 * @param root0
	 * @param root0.id
	 * @param root0.currentHash
	 * @returns {Promise<void>}
	 */
	async issue({
		id,
		currentHash,
	}: RequireOnlyOne<IdOrHash, 'currentHash' | 'id'>): Promise<void> {
		await this.$update({ currentHash, id }, { lastIssue: currentTime() });
	}

	/**
	 * Find continuous bloc.
	 *
	 * @example
	 *
	 * ```ts
	 * this.findContinuousBloc(hash);
	 * ```
	 *
	 * @param {string} currentHash - Current bloc id.
	 * @returns {Promise<Bloc | undefined>} Found bloc by request.
	 */
	async findContinuousBloc(currentHash: string): Promise<Bloc | undefined> {
		return this.findOne({ cache: false, previousHash: currentHash });
	}

	/**
	 * Find bloc by hash.
	 *
	 * @example
	 *
	 * ```ts
	 * this.currentHash(hash);
	 * ```
	 *
	 * @param {string | undefined} currentHash - Current bloc hash.
	 * @returns {Promise<Bloc | undefined>} Found bloc by hash.
	 */
	async currentHash(
		currentHash: string | undefined,
	): Promise<Bloc | undefined> {
		if (currentHash == undefined)
			throw new ServerException('Invalid', 'Input', 'Submit');

		return this.findOne({ currentHash, cache: false });
	}
}
