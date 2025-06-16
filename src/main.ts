import { HttpException, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import Fastify from 'fastify';
import { Server, createServer } from 'http';
import { MainModule } from 'modules/main';
import { fastifyServerOptions, serverOrigin } from 'utils/app/constants';
import {
	initializePluginsFastify,
	setupStaticFastify,
} from 'utils/app/fastify';
import { AppExceptionFilter } from 'utils/app/filter';
import { ServerException } from 'utils/error';

async function bootstrap() {
	let server: Server;

	const fastify = Fastify({
			...fastifyServerOptions,
			serverFactory: (handler) =>
				(server = createServer((req, res) => handler(req, res))),
		}),
		app = await NestFactory.create<NestFastifyApplication>(
			MainModule,
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
	setupStaticFastify(fastify);

	await initializePluginsFastify(fastify, {
		name: process.env.npm_package_name || 'app',
		password: config.get<string>('SERVER_SECRET', (32).string),
	});

	fastify.ready((err) => {
		if (err) {
			new ServerException(
				'Fatal',
				'Server',
				'Implementation',
				new HttpException('Fastify initialization error', 500),
			).terminalLogging();

			process.exit(1);
		}

		server.listen(config.get<number>('SERVER_PORT'));
	});

	// Swagger initialization
	SwaggerModule.setup('api', app, () =>
		SwaggerModule.createDocument(
			app,
			new DocumentBuilder()
				.setTitle('API Documentation')
				.setDescription('API documentation for the application')
				.addSecurity('CsrfToken', {
					type: 'apiKey',
					in: 'header',
					name: 'csrf-token',
				})
				.build(),
		),
	);
}
bootstrap();
