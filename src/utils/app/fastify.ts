import fastifyCompress from '@fastify/compress';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import fastifyHelmet from '@fastify/helmet';
import fastifySecureSession from '@fastify/secure-session';
import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';
import { join } from 'node:path';
import { constants } from 'node:zlib';

import { cookieOptions } from './constants';
import { CookieCredential } from './types';

/**
 * Sets up static file serving for a Fastify instance.
 * @param {FastifyInstance} fastify - The Fastify instance to configure.
 * @returns {void}
 * @example
 * setupStaticFastify(fastify);
 */
export function setupStaticFastify(fastify: FastifyInstance): void {
	fastify
		.register(
			(childContext, _, done) => {
				const root = join(process.cwd(), 'page/dist');

				childContext.setNotFoundHandler((_, reply) =>
					reply.type('text/html').sendFile('index.html', root),
				);
				childContext.register(fastifyStatic, { root });
				done();
			},
			{ prefix: '/' },
		)
		.register(fastifyStatic, {
			prefix: '/docs',
			root: join(process.cwd(), 'docs'),
			redirect: true,
		});
}

/**
 * Initializes Fastify plugins for the application.
 * @param {FastifyInstance} fastify - The Fastify instance to configure.
 * @param {CookieCredential} credentials - The credentials for secure session and CSRF protection.
 * @returns {Promise<void>} A promise that resolves when the plugins are initialized.
 * @example
 * initializePluginsFastify(fastify, { name: 'app', password: 'your-secret-password' });
 */
export async function initializePluginsFastify(
	fastify: FastifyInstance,
	{ name, password }: CookieCredential,
): Promise<void> {
	await fastify
		.register(fastifyCompress, {
			encodings: ['gzip', 'deflate'],
			brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 6 } },
		})
		.register(fastifySecureSession, {
			cookieName: 'session',
			cookie: cookieOptions,
			secret: password,
			key: Buffer.from(password.slice(0, 32).padStart(32)),
			salt: (256).string,
		})
		.register(fastifyCsrfProtection, {
			sessionKey: name,
			cookieKey: 'csrf',
			cookieOpts: cookieOptions,
			sessionPlugin: '@fastify/secure-session',
			csrfOpts: { validity: (180).s2ms },
		})
		.register(fastifyHelmet, {
			contentSecurityPolicy: {
				directives: {
					defaultSrc: [`'self'`, 'unpkg.com'],
					styleSrc: [
						`'self'`,
						`'unsafe-inline'`,
						'cdn.jsdelivr.net',
						'fonts.googleapis.com',
						'unpkg.com',
					],
					fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
					imgSrc: [
						`'self'`,
						'data:',
						'blob:',
						'cdn.jsdelivr.net',
						'validator.swagger.io',
						'apollo-server-landing-page.cdn.apollographql.com',
					],
					scriptSrc: [
						`'self'`,
						`https: 'unsafe-inline'`,
						`cdn.jsdelivr.net`,
						`'unsafe-eval'`,
					],
					manifestSrc: [
						`'self'`,
						'apollo-server-landing-page.cdn.apollographql.com',
					],
					frameSrc: [
						`'self'`,
						'sandbox.embed.apollographql.com',
						'explorer.embed.apollographql.com',
					],
					objectSrc: ["'self'"],
				},
			},
		});
}
