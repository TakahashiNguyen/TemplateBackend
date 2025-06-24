import { FindOptionsWhere } from 'typeorm';

/** Extend find options. */
export type ExtendedFindOneOptions = {
	deep?: number;
	order?: object;
	relations?: string[];
	cache?: boolean;
	writeLock?: boolean;
};

/** Extend find options for many. */
export type ExtendedFindOptions = ExtendedFindOneOptions & {
	take?: number;
	skip?: number;
};

/** Saving options. */
export type ExtendedSaveOptions = { raw?: boolean; validate?: boolean };

/** Extended find where. */
export type FindWhereExtend<T, K> = FindOptionsWhere<T> & K;

/** Non function properties. */
export type GetAttributes<T> = Pick<
	T,
	{
		 
		[K in keyof T]: T[K] extends (..._: unknown[]) => unknown ? never : K;
	}[keyof T]
>;
