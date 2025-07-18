import { createKeyv as createRedisKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';
import Keyv from 'keyv';
import { cacheDurationMs } from 'utils/app/constants';

/** Cache module configuration for NestJS. */
export const cacheModule = CacheModule.registerAsync({
	imports: [ConfigModule],
	useFactory: (config: ConfigService) => ({
		stores: [
			new Keyv({
				store: new Cacheable({
					secondary: createRedisKeyv({ url: config.get('REDIS_URL') }),
					ttl: cacheDurationMs,
					namespace: process.env.npm_package_name || 'app',
					nonBlocking: true,
				}),
			}),
		],
	}),
	inject: [ConfigService],
	isGlobal: true,
});
