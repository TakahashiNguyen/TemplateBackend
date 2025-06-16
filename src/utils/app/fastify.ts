import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';
import { join } from 'node:path';

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
