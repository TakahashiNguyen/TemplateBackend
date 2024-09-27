import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { tstStr } from 'utils/utils';

export const loadEnv = (type: 'deploy' | 'test') =>
	// Load .env
	ConfigModule.forRoot({
		isGlobal: true,
		validationSchema: Joi.object({
			// Postgres
			POSTGRES_HOST: Joi.string().default('localhost'),
			POSTGRES_PORT: Joi.number().default(5432),
			POSTGRES_USER: Joi.string().default('postgres'),
			POSTGRES_DB: Joi.string().default('tmplrv'),
			POSTGRES_PASS: Joi.string().default('postgres'),
			// Access token
			ACCESS_SECRET:
				type === 'deploy'
					? Joi.string().required()
					: Joi.string().default(tstStr()),
			ACCESS_EXPIRE: Joi.string().default('6m'),
			// Refresh token
			REFRESH_SECRET:
				type === 'deploy'
					? Joi.string().required()
					: Joi.string().default(tstStr()),
			REFRESH_EXPIRE: Joi.string().default('66d'),
			REFRESH_USE: Joi.number().default(6),
			// Server config
			SERVER_SECRET: Joi.string().default((64).alpha),
			SERVER_IN_DEV: Joi.bool().default(true),
			SERVER_PORT: Joi.number().default(3000),
			SERVER_COOKIE_PREFIX: Joi.string().default((12).alpha),
			SERVER_PUBLIC: Joi.string().default('./public/'),
			// AES
			AES_ALGO: Joi.string().default('aes-256-ctr'),
			// ADMIN
			ADMIN_EMAIL: Joi.string().default('admin'),
			ADMIN_PASSWORD: Joi.string().default('admin'),
			// Custom keys
			REFRESH_KEY: Joi.string().default((32).string),
			ACCESS_KEY: Joi.string().default((32).string),
		}),
	});
