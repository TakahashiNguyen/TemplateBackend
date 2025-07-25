import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';
import Joi from 'joi';

config({ path: process.cwd() + '/.env', override: true, quiet: true });

/** Loads environment variables from a .env file and validates them using Joi. */
export const configModule = ConfigModule.forRoot({
	isGlobal: true, // Makes the configuration available globally
	validationSchema: Joi.object({
		// PostgreSQL database connection
		DB_HOST: Joi.string().default('localhost'),
		DB_PORT: Joi.number().default(5432),
		DB_USER: Joi.string().default('postgres'),
		DB_NAME: Joi.string().default('postgres'),
		DB_PASS: Joi.string().default('postgres'),
		// JWT tokens
		// Access token
		ACCESS_SECRET: Joi.string().required(),
		ACCESS_EXPIRE: Joi.string().default('5m'),
		// Refresh token
		REFRESH_SECRET: Joi.string().required(),
		REFRESH_EXPIRE: Joi.string().default('60d'),
		// Server settings
		SERVER_SECRET: Joi.string().required(),
		SERVER_PORT: Joi.number().default(3000),
		SERVER_FILE_SIZE_LIMIT: Joi.number().default(256),
		// Admin settings
		ADMIN_EMAIL: Joi.string().default('test@test.test'),
		// AWS S3 settings
		AWS_ENDPOINT: Joi.string().default('http://127.0.0.1:9000 '),
		AWS_REGION: Joi.string().default('us-east-1'),
		AWS_BUCKET: Joi.string().default('default'),
		AWS_ACCESS_KEY_ID: Joi.string().default('minioadmin'),
		AWS_SECRET_ACCESS_KEY: Joi.string().default('minioadmin'),
		// Email settings
		SMTP_HOST: Joi.string().default('localhost'),
		SMTP_USER: Joi.string().default('mailpit'),
		SMTP_PASS: Joi.string().default('mailpit'),
		// Redis settings
		REDIS_URL: Joi.string().default('redis://default:@localhost:6379'),
	}),
});
