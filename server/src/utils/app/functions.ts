import { DynamicModule, Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { validateOrReject } from 'class-validator';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ServerException } from 'utils/error/classes';
import { BaseEntity, DatabaseRequests } from 'utils/typeorm/classes';

import { Paging } from './dto';
import { IPaginateResult } from './interfaces';

/**
 * The function validate object has `validate-class` decorators.
 *
 * @example
 *
 * ```ts
 * import { IsString } from 'class-validator';
 * class Foo { IsString() name: string; }
 * const foo = new Foo();
 * foo.name = 'Bar';
 * validateObject(foo); // foo.
 * ```
 *
 * @template T - Type that extended `object`.
 * @param {T} input - The value extends `object` and has `class-validator`
 *   decorators.
 * @returns {Promise<T>} `input` if `input` meets all `class-validator`
 *   decorators requirements.
 * @throws {ServerException} Throw an error when `input` doesn't meet all
 *   `class-validator` decorators.
 */
export async function validateObject<T extends object>(input: T): Promise<T> {
	try {
		await validateOrReject(input);

		return input;
	} catch (error) {
		throw new ServerException('Invalid', 'Entity', 'Submit', error as Error);
	}
}

/**
 * Sort object by keys.
 *
 * @example
 *
 * ```ts
 * const foo = { b: 'bar', a: 'alpha' };
 * sortObjectKeys(foo); // {a: 'alpha', b: 'bar'}
 * ```
 *
 * @param {object} input - Object needs to sort by keys.
 * @returns {object} Sorted `input`.
 */
export function sortObjectKeys(input: object): object {
	return Object.keys(input)
		.sort()
		.reduce((obj: object, key: string) => {
			if (typeof input[key as keyof typeof input] == 'object')
				Object.assign(obj, {
					[key]: sortObjectKeys(input[key as keyof typeof input]),
				});
			else Object.assign(obj, { [key]: input[key as keyof typeof input] });

			return obj;
		}, {});
}

/**
 * Get current system time.
 *
 * @example
 *
 * ```ts
 * const time = currentTime();
 * ```
 *
 * @returns {number} Current system time.
 */
export function currentTime(): number {
	return Math.floor(new Date().getTime() / 1000);
}

/**
 * Get default export from each subdirectory from `directory`.
 *
 * @example
 *
 * ```ts
 * getDefaultExportFromSubdirectory(__dirname);
 * ```
 *
 * @param {string} directory - Current directory.
 * @returns {DynamicModule[]} Array of nestjs modules.
 */
export function getDefaultExportFromSubdirectory(
	directory: string,
): DynamicModule[] {
	return readdirSync(directory, { withFileTypes: true })
		.filter((i) => i.isDirectory())
		.map((i) => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				return require(join(i.parentPath, i.name)).default;
			} catch (error) {
				switch (true) {
					// @ts-expect-error error-free expression
					case error.code == 'MODULE_NOT_FOUND':
						break;

					default:
						console.warn((error as Error).message);
						break;
				}
			}
		})
		.filter((i) => i != undefined);
}

/**
 * Paginating entity.
 *
 * @example
 *
 * ```ts
 * PaginatedEntity(Entity);
 * ```
 *
 * @template T
 * @param {Type<T>} ItemType - Entity type.
 */
export function PaginatedEntity<T>(
	ItemType: Type<T>,
): Type<IPaginateResult<T>> {
	/** Paginated output class. */
	@ObjectType({ isAbstract: true })
	class PaginateClass implements IPaginateResult<T> {
		/** Found entities. */
		@Field(() => [ItemType]) entities!: T[];

		/** Number of entities found. */
		@Field() total!: number;

		/** Current page index. */
		@Field() currentPage!: number;

		/** Total pages number. */
		@Field() totalPages!: number;

		/** Page size number. */
		@Field() pageSize!: number;

		/** If it has next page. */
		@Field() hasNext!: boolean;

		/** If it has previous page. */
		@Field() hasPrevious!: boolean;
	}

	return PaginateClass;
}

/**
 * Paginate response converter.
 *
 * @example
 *
 * ```ts
 * paginateResponse();
 * ```
 *
 * @template C
 * @template T
 * @template P
 * @param {DatabaseRequests<C, T, P>} service - Service input.
 * @param {Parameters<(typeof DatabaseRequests.prototype)['find']>} args - Find
 *   arguments.
 * @param {Paging} root0
 * @param {number} root0.index
 * @param {number} root0.take
 */
export async function paginateResponse<
	C extends new (args: P) => T,
	T extends BaseEntity,
	P extends object,
>(
	service: DatabaseRequests<C, T, P>,
	args: Parameters<DatabaseRequests<C, T, P>['find']>,
	{ index, take }: Paging,
): Promise<IPaginateResult<T>> {
	const total = await service.total(),
		totalPages = total / take + 1;
	return {
		entities: await service.find(...{ ...args, take, skip: index * take }),
		total,
		totalPages,
		currentPage: index,
		pageSize: take,
		hasNext: !(index < totalPages - 1),
		hasPrevious: index != 0,
	};
}
