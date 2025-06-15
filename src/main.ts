import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createServer, Server } from 'http';
import Fastify, { FastifyServerOptions } from 'fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppExceptionFilter } from 'app.filter';
import { AppModule } from 'app.module';
import { ConfigService } from '@nestjs/config';

const fastifyServerOptions: FastifyServerOptions = {
		maxParamLength: 128,
	},
	serverOrigin = /^https?:\/\/(.*)$/;

async function bootstrap() {
	let server: Server;

	const fastify = Fastify({
			...fastifyServerOptions,
			serverFactory: (handler) =>
				(server = createServer((req, res) => handler(req, res))),
		}),
		app = await NestFactory.create<NestFastifyApplication>(
			AppModule,
			new FastifyAdapter(fastify),
			{
				cors: {
					origin: process.argv.some((i) => i == '--localhost')
						? /^https?:\/\/localhost(:\d+)?$/
						: process.argv.some((i) => i == '--disable-CORS')
							? '*'
							: serverOrigin,
					methods: '*',
					credentials: true,
				},
			},
		),
		httpAdapter = app.getHttpAdapter(),
		config = app.get(ConfigService);

	// App initialization
	await app
		.setGlobalPrefix('api')
		.useGlobalPipes(new ValidationPipe())
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.enableVersioning({ type: VersioningType.URI })
		.init();

	// Fastify initialization
	fastify.ready((err) => {
		if (err) {
			console.error('Fastify initialization error:', err);
			process.exit(1);
		}

		server.listen(config.get<string>('SERVER_PORT'));
	});
}
bootstrap();
