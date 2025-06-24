import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions, DatabaseType, QueryRunner } from 'typeorm';
import { QueryResultCache } from 'typeorm/cache/QueryResultCache';
import { QueryResultCacheOptions } from 'typeorm/cache/QueryResultCacheOptions';
import { cacheDurationMs } from 'utils/app/constants';
import { unidirectionalHash } from 'utils/data/funtions';

/**
 * Server database configuration.
 *
 * @example
 *
 * ```ts
 * const dbOptions = getDatabaseConnection('postgres', configService);
 * ```
 *
 * @param {DatabaseType} type - The type of the database (e.g., 'postgres',
 *   'mysql').
 * @param {ConfigService} configService - The configuration service to retrieve
 *   database settings.
 * @returns The database connection options.
 */
function getDatabaseConnection(
	type: DatabaseType,
	configService: ConfigService,
): DataSourceOptions {
	return {
		type,
		host: configService.get('DB_HOST'),
		port: configService.get('DB_PORT'),
		username: configService.get('DB_USER'),
		password: configService.get<string>('DB_PASS'),
		database: configService.get('DB_NAME'),
	} as DataSourceOptions;
}

/**
 * Creates a TypeORM module for the specified database type.
 *
 * @example
 *
 * ```ts
 * const dbModule = databaseModule('postgres');
 * ```
 *
 * @param {DatabaseType} type - The type of the database (e.g., 'postgres',
 *   'mysql').
 * @returns {DynamicModule} The TypeORM module configured for the specified
 *   database type.
 */
export function typeOrmModule(type: DatabaseType): DynamicModule {
	return TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService, CACHE_MANAGER],
		useFactory: async (configService: ConfigService, cache: Cache) => {
			return {
				...getDatabaseConnection(type, configService),
				autoLoadEntities: true,
				synchronize: true,
				cache: {
					duration: cacheDurationMs,
					provider: () => new DatabaseCacheManager(cache),
				},
			};
		},
	});
}

/** Database cache manager class. */
class DatabaseCacheManager implements QueryResultCache {
	/**
	 * Prefix for cache keys to avoid conflicts with other caches.
	 *
	 * @default 'TypeOrm'
	 */
	private keyPrefix: string = 'TypeOrm';

	/**
	 * Creates an instance of DatabaseCacheManager.
	 *
	 * @example
	 *
	 * ```ts
	 * const cacheManager = new DatabaseCacheManager(cacheInstance);
	 * ```
	 *
	 * @param {Cache} cache - The cache instance to use for storing and retrieving
	 *   cache entries.
	 */
	constructor(private cache: Cache) {}

	/**
	 * Generates a unique identifier for the cache entry based on the query
	 * string.
	 *
	 * @example
	 *
	 * ```ts
	 * this.generateIdentifier('SELECT foo FROM bar;');
	 * ```
	 *
	 * @param {string} query - The query string to generate the identifier from.
	 * @returns A unique identifier for the cache entry.
	 */
	private generateIdentifier(query: string): string {
		return unidirectionalHash(query);
	}

	/**
	 * Connects the cache manager.
	 *
	 * @deprecated This method is not implemented and does nothing.
	 * @example
	 *
	 * ```ts
	 * this.connect();
	 * ```
	 */
	connect(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * Disconnects the cache manager.
	 *
	 * @example
	 *
	 * ```ts
	 * this.disconnect();
	 * ```
	 */
	disconnect(): Promise<void> {
		return this.cache.disconnect();
	}

	/**
	 * Synchronizes the cache with the database. This method is a no-op in this
	 * implementation.
	 *
	 * @deprecated This method is not implemented and does nothing.
	 * @example Operations.
	 *
	 * @param {QueryRunner} [queryRunner] - The query runner used for database.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	synchronize(queryRunner?: QueryRunner): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * Retrieves a cache entry based on the provided options.
	 *
	 * @example
	 *
	 * ```ts
	 * this.getFromCache({});
	 * ```
	 *
	 * @param {QueryResultCacheOptions} options - The options containing the
	 *   identifier or query to retrieve the cache.
	 * @returns {Promise<QueryResultCacheOptions>} A promise that resolves to the.
	 */
	async getFromCache(
		options: QueryResultCacheOptions,
	): Promise<QueryResultCacheOptions> {
		const { identifier, query = '', duration } = options,
			key = `${this.keyPrefix}${identifier || this.generateIdentifier(query)}`,
			result = await this.cache.get(key);

		return { identifier: key, duration, query, result };
	}

	/**
	 * Stores a cache entry based on the provided options.
	 *
	 * @example
	 *
	 * ```ts
	 * this.storeInCache({}, {});
	 * ```
	 *
	 * @param {QueryResultCacheOptions} options - The options containing the
	 *   identifier, query, duration, and result to store in the cache.
	 * @param {QueryResultCacheOptions} savedCache - The cache options that were.
	 */
	async storeInCache(
		options: QueryResultCacheOptions,
		savedCache: QueryResultCacheOptions,
	): Promise<void> {
		const { identifier: savedIdentifier, query: savedQuery = '' } = savedCache,
			{
				identifier = savedIdentifier,
				query = savedQuery,
				duration,
				result,
			} = options,
			key = `${this.keyPrefix}${identifier || this.generateIdentifier(query)}`;

		await this.cache.set(key, result, duration);
	}

	/**
	 * Checks if the cache entry has expired.
	 *
	 * @deprecated This method is not implemented and always returns false.
	 * @example
	 *
	 * ```ts
	 * this.isExpired({});
	 * ```
	 *
	 * @param {QueryResultCacheOptions} savedCache - The cache options that were
	 *   saved.
	 * @returns Always returns false, as this implementation does not handle.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	isExpired(savedCache: QueryResultCacheOptions): boolean {
		return false;
	}

	/**
	 * Clears all cache entries.
	 *
	 * @example
	 *
	 * ```ts
	 * This.clear();
	 * ```
	 */
	async clear(): Promise<void> {
		await this.cache.clear();
	}

	/**
	 * Removes cache entries by their identifiers.
	 *
	 * @example
	 *
	 * ```ts
	 * This.remove(['foo', 'bar']);
	 * ```
	 *
	 * @param {string[]} identifiers - Array of cache identifiers to remove.
	 */
	async remove(identifiers: string[]) {
		for (const key of identifiers) await this.cache.del(key);
	}
}
