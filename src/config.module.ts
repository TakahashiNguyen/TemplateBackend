import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { randomBytes } from 'crypto';
import Joi from 'joi';

@Module({
	imports: [
		// Load .env
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				// Postgres
				POSTGRES_HOST: Joi.string().default('localhost'),
				POSTGRES_PORT: Joi.number().default(5432),
				POSTGRES_USER: Joi.string().default('postgres'),
				POSTGRES_DB: Joi.string().default('database'),
				POSTGRES_PASS: Joi.string().default('postgres'),
				// Access token
				ACCESS_SECRET: Joi.string().required(),
				ACCESS_EXPIRES: Joi.string().default('5m'),
				// Refresh token
				REFRESH_SECRET: Joi.string().required(),
				REFRESH_EXPIRE: Joi.string().default('366d'),
				REFRESH_USE: Joi.number().default(6),
				// Server config
				SERVER_SECRET: Joi.string().default(randomBytes(8).toString('hex')),
				SERVER_IN_DEV: Joi.bool().default(true),
				SERVER_PORT: Joi.number().default(3000),
				SERVER_COOKIE_PREFIX: Joi.string().default(
					randomBytes(3).toString('hex'),
				),
				// bcrypt
				BCRYPT_SALT: Joi.number().default(6),
				// AES
				AES_ALGO: Joi.string().default('aes-256-ctr'),
				// ADMIN
				ADMIN_EMAIL: Joi.string().default('admin'),
				ADMIN_PASSWORD: Joi.string().default('admin'),
				// Custom keys
				REFRESH_KEY: Joi.string().default(randomBytes(6).toString('hex')),
				ACCESS_KEY: Joi.string().default(randomBytes(6).toString('hex')),
			}),
		}),
	],
})
export class LoadEnvModule {}
