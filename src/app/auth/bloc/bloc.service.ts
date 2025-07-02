import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'app/user/user.entity';
import { Repository } from 'typeorm';
import { currentTime } from 'utils/app/functions';
import { GetAttributes, RequireOnlyOne } from 'utils/app/types';
import { ServerException } from 'utils/error';
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
	 * @param {RequireOnlyOne<IdOrHash, 'currentHash' | 'id'>} objects - Removing
	 *   tree's sub-bloc id or hash.
	 */
	async removeTree({
		id: targetId,
		currentHash: targetCurrentHash,
	}: RequireOnlyOne<IdOrHash, 'currentHash' | 'id'>) {
		const currentBloc =
			(await this.id(targetId)) || (await this.currentHash(targetCurrentHash));

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
			throw new ServerException('Invalid', 'Input', '');

		return this.findOne({ currentHash, cache: false });
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

			metadata =
				(await this.findContinuousBloc(previousHash))?.metadata || metadata;

			return previousHash;
		};

		const bloc = new Bloc({ owner, previousHash: await updatePrev() });

		if (metadata) bloc.metadata = metadata;

		return this.create(bloc);
	}
}
