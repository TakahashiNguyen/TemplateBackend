import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions, DatabaseType, QueryRunner } from 'typeorm';
import { QueryResultCache } from 'typeorm/cache/QueryResultCache';
import { QueryResultCacheOptions } from 'typeorm/cache/QueryResultCacheOptions';
import { cacheDurationMs } from 'utils/app/constants';
import { hashing } from 'utils/data/funtions';

/**
 * Server database configuration
 * @param {DatabaseType} type - The type of the database (e.g., 'postgres', 'mysql').
 * @param {ConfigService} configService - The configuration service to retrieve database settings.
 * @returns {DataSourceOptions} The database connection options.
 * @example
 * const dbOptions = getDatabaseConnection('postgres', configService);
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
 * @param {DatabaseType} type - The type of the database (e.g., 'postgres', 'mysql').
 * @returns {DynamicModule} The TypeORM module configured for the specified database type.
 * @example
 * const dbModule = databaseModule('postgres');
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
					provider() {
						return new DatabaseCacheManager(cache);
					},
				},
			};
		},
	});
}

class DatabaseCacheManager implements QueryResultCache {
	/**
	 * Prefix for cache keys to avoid conflicts with other caches.
	 * @private
	 * @type {string}
	 * @default 'TypeOrm'
	 */
	private keyPrefix: string = 'TypeOrm';

	/**
	 * Creates an instance of DatabaseCacheManager.
	 * @param {Cache} cache - The cache instance to use for storing and retrieving cache entries.
	 * @constructor
	 * @example
	 * const cacheManager = new DatabaseCacheManager(cacheInstance);
	 */
	constructor(private cache: Cache) {}

	/**
	 * Generates a unique identifier for the cache entry based on the query string.
	 * @param {string} query - The query string to generate the identifier from.
	 * @returns {string} A unique identifier for the cache entry.
	 * @private
	 */
	private generateIdentifier(query: string): string {
		return hashing(query);
	}

	/**
	 * Connects the cache manager.
	 * @deprecated This method is not implemented and does nothing.
	 */
	connect(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * Disconnects the cache manager.
	 */
	disconnect(): Promise<void> {
		return this.cache.disconnect();
	}

	/**
	 * Synchronizes the cache with the database.
	 * This method is a no-op in this implementation.
	 * @param {QueryRunner} [queryRunner] - The query runner used for database operations.
	 * @deprecated This method is not implemented and does nothing.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	synchronize(queryRunner?: QueryRunner): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * Retrieves a cache entry based on the provided options.
	 * @param {QueryResultCacheOptions} options - The options containing the identifier or query to retrieve the cache.
	 * @returns {Promise<QueryResultCacheOptions>} A promise that resolves to the cache options if found, or undefined if not found.
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
	 * @param {QueryResultCacheOptions} options - The options containing the identifier, query, duration, and result to store in the cache.
	 * @param {QueryResultCacheOptions} savedCache - The cache options that were saved previously.
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
	 * @param {QueryResultCacheOptions} savedCache - The cache options that were saved.
	 * @return {boolean} Always returns false, as this implementation does not handle expiration.
	 * @deprecated This method is not implemented and always returns false.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	isExpired(savedCache: QueryResultCacheOptions): boolean {
		return false;
	}

	/**
	 * Clears all cache entries.
	 */
	async clear(): Promise<void> {
		await this.cache.clear();
	}

	/**
	 * Removes cache entries by their identifiers.
	 * @param {string[]} identifiers - Array of cache identifiers to remove.
	 */
	async remove(identifiers: string[]): Promise<void> {
		for (const key of identifiers) await this.cache.del(key);
	}
}
