import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'app/user/user.entity';
import { Repository } from 'typeorm';
import { currentTime } from 'utils/app/functions';
import { GetAttributes, RequireOnlyOne } from 'utils/app/types';
import { DatabaseRequests } from 'utils/typeorm/classes';

import { Bloc } from './bloc.entity';

/** Bloc identifier. */
type IdOrHash = Pick<GetAttributes<Bloc>, 'id' | 'currentHash'>;

/** Bloc required infomations. */
type BlocInput = Pick<GetAttributes<Bloc>, 'previousHash' | 'metadata'>;

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
	 * Create Bloc.
	 *
	 * @example
	 *
	 * ```ts
	 * this.create(bloc);
	 * ```
	 *
	 * @param {Parameters<typeof this.$create>} args - Input parameters.
	 * @returns {Promise<Bloc>} Instance of Bloc.
	 */
	public create(...args: Parameters<typeof this.$create>): Promise<Bloc> {
		return this.$create(...args);
	}

	/**
	 * Update Bloc.
	 *
	 * @example
	 *
	 * ```ts
	 * this.update(bloc);
	 * ```
	 *
	 * @param {Parameters<typeof this.$update>} args - Input parameters.
	 * @returns {Promise<void>}
	 */
	public update(...args: Parameters<typeof this.$update>): Promise<void> {
		return this.$update(...args);
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
	 * @param {string} blocId - Removing tree's sub-bloc id.
	 */
	async removeTree(blocId: string) {
		if (!blocId) return;

		const { previousHash } = await this.id(blocId),
			{ id } = await this.findContinuousBloc(blocId);

		await this.delete(blocId);

		if (previousHash) await this.removeTree(previousHash);
		await this.removeTree(id);
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
		await this.update({ currentHash, id }, { lastIssue: currentTime() });
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
	 * @param {string} hash - Current bloc id.
	 * @returns {Promise<Bloc>} Found bloc by request.
	 */
	async findContinuousBloc(hash: string): Promise<Bloc> {
		return this.findOne({ cache: false, previousHash: hash });
	}

	/**
	 * Find bloc by hash.
	 *
	 * @example
	 *
	 * ```ts
	 * this.findBlocByHash(hash);
	 * ```
	 *
	 * @param {string} hash - Current bloc hash.
	 * @returns {Promise<Bloc>} Found bloc by hash.
	 */
	async findBlocByHash(hash: string): Promise<Bloc> {
		return this.findOne({ currentHash: hash, cache: false });
	}

	/**
	 * Assign new bloc.
	 *
	 * @example
	 *
	 * ```ts
	 * this.assign(owner, { previousHash });
	 * ```
	 *
	 * @param {User} owner - The owner of bloc id.
	 * @param root0
	 * @param root0.previousHash
	 * @param root0.metadata
	 * @returns {Promise<Bloc>} Bloc instance.
	 */
	async assign(
		owner: User,
		{
			previousHash,
			metadata,
		}: RequireOnlyOne<BlocInput, 'metadata' | 'previousHash'>,
	): Promise<Bloc> {
		const updatePrev = async () => {
			if (!previousHash) return undefined;

			const { metadata: continuousMetadata } =
				await this.findContinuousBloc(previousHash);

			metadata = continuousMetadata;

			return previousHash;
		};

		const bloc = new Bloc({ owner, previousHash: await updatePrev() });

		if (metadata) bloc.metadata = metadata;

		return this.create(bloc);
	}
}
