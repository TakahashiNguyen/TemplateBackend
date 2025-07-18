import { CookieSerializeOptions } from '@fastify/csrf-protection';
import { FastifyServerOptions } from 'fastify';
import { DatabaseType } from 'typeorm';
import 'utils';

/** Fastify server options for configuration. */
export const fastifyServerOptions: FastifyServerOptions = {
	maxParamLength: 128,
};

/** Regular expression to match server origin URLs. */
export const serverOrigin = /^https?:\/\/(.*)$/;

/** Cookie properties for secure session and CSRF protection. */
export const cookieOptions: CookieSerializeOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	signed: true,
	path: '/',
};

/** Cache duration for database queries. */
export const cacheDurationMs = (5).m2s.s2ms; // Cache duration in milliseconds (5 minute)

/** Server database type. */
export const databaseType: DatabaseType = 'postgres';

/** Server's maximum file uploading size in megabytes. */
export const fileSizeMaximum = 50;
