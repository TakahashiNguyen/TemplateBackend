import fastifyCompress from '@fastify/compress';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import fastifyHelmet from '@fastify/helmet';
import fastifySecureSession from '@fastify/secure-session';
import fastifyStatic from '@fastify/static';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Fastify, { FastifyInstance } from 'fastify';
import { Server, createServer } from 'node:http';
import { join } from 'node:path';
import { constants } from 'node:zlib';
import { ServerException } from 'utils/error';

import { cookieOptions, fastifyServerOptions } from './constants';
import { CookieCredential } from './types';

/**
 * FastifyFramework class encapsulates the Fastify server setup and configuration.
 * It initializes the server, registers plugins, and sets up static file serving.
 */
export class FastifyFramework {
	/**
	 * The Fastify instance used for server operations.
	 */
	private _fastify: FastifyInstance;

	/**
	 * The underlying HTTP server instance.
	 */
	private server: Server;

	/**
	 * Creates a new instance of the FastifyFramework.
	 * It initializes the Fastify server with custom options and sets up the server factory.
	 * @example
	 * const fastifyFramework = new FastifyFramework();
	 */
	constructor() {
		this._fastify = Fastify({
			...fastifyServerOptions,
			serverFactory: (handler) => createServer((req, res) => handler(req, res)),
		});
		this.server = this.fastify.server;
	}

	/**
	 * Gets the Fastify instance.
	 * @returns {FastifyInstance} The Fastify instance.
	 * @example
	 * const fastifyInstance = fastifyFramework.fastify;
	 */
	get fastify(): FastifyInstance {
		return this._fastify;
	}

	/**
	 * Initializes static file serving for the Fastify server.
	 * It sets up a not found handler to serve the main index.html file
	 * and registers static file serving for the main page and documentation.
	 * @private
	 * @example
	 * this.initializeStatic();
	 */
	private initializeStatic(): void {
		this.fastify
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
	 * Initializes Fastify plugins for the server.
	 * It registers plugins for compression, secure sessions, CSRF protection, and security headers.
	 * @param {CookieCredential} cookieCredential - An object containing the name and password for secure session cookies.
	 * @returns {Promise<void>} A promise that resolves when the plugins are initialized.
	 * @private
	 * @example
	 * await this.initializePlugins({ name: 'session', password: 'your-secure-password' });
	 */
	private async initializePlugins(
		cookieCredential: CookieCredential,
	): Promise<void> {
		const { name, password } = cookieCredential;

		await this.fastify
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

	/**
	 * Sets up the Fastify server with the provided configuration and cookie credentials.
	 * It initializes static file serving and registers necessary plugins.
	 * @param {ConfigService} config - The configuration service to retrieve server settings.
	 * @param {CookieCredential} cookieCredential - An object containing the name and password for secure session cookies.
	 * @returns {Promise<void>} A promise that resolves when the server is set up and ready to listen.
	 * @example
	 * await fastifyFramework.setup(configService, { name: 'session', password: 'your-secure-password' });
	 */
	public async setup(
		config: ConfigService,
		cookieCredential: CookieCredential,
	): Promise<void> {
		this.initializeStatic();
		await this.initializePlugins(cookieCredential);

		this.fastify.ready((err) => {
			if (err) {
				new ServerException(
					'Fatal',
					'Server',
					'Implementation',
					new HttpException('Fastify initialization error', 500),
				).terminalLogging();

				process.exit(1);
			}

			this.server.listen(config.get<number>('SERVER_PORT'));
		});
	}
}
