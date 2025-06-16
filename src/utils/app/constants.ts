import { CookieSerializeOptions } from '@fastify/csrf-protection';
import { FastifyServerOptions } from 'fastify';

/**
 * Fastify server options for configuration.
 */
export const fastifyServerOptions: FastifyServerOptions = {
	maxParamLength: 128,
};

/**
 * Regular expression to match server origin URLs.
 */
export const serverOrigin = /^https?:\/\/(.*)$/;

/**
 * Cookie properties for secure session and CSRF protection.
 */
export const cookieOptions: CookieSerializeOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	signed: true,
	path: '/',
};
