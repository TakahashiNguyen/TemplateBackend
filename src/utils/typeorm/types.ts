import { FindOptionsWhere } from 'typeorm';

/** Extend find options. */
export type ExtendedFindOneOptions = {
	/** Find depth. */
	deep?: number;

	/** Find order. */
	order?: object;

	/** Find entity with relations. */
	relations?: string[];

	/** Find in cache. */
	cache?: boolean;

	/** Find without race conditions. */
	writeLock?: boolean;
};

/** Extend find options for many. */
export type ExtendedFindOptions = ExtendedFindOneOptions & {
	/** Number of retrieved entity. */
	take?: number;

	/** Number of skipped entity. */
	skip?: number;
};

/** Saving options. */
export type CreateOptions = {
	/** Raw saving. */
	raw?: boolean;

	/** Validate before saving. */
	validate?: boolean;
};

/**
 * Extended find where.
 *
 * @template T
 * @template K
 */
export type FindWhereExtend<T, K> = FindOptionsWhere<T> & K;

/**
 * Get entity parameters.
 *
 * @template T
 */
export type EntityParameters<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends abstract new (...args: any) => any,
> = ConstructorParameters<T>[0];
