import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import Modules from 'modules';
import { serverOrigin } from 'utils/app/constants';
import { FastifyFramework } from 'utils/app/fastify';
import { AppExceptionFilter } from 'utils/app/filter';

async function bootstrap() {
	const fastifyFramework = new FastifyFramework(),
		app = await NestFactory.create<NestFastifyApplication>(
			Modules,
			new FastifyAdapter(fastifyFramework.fastify),
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
	fastifyFramework.setup(config, {
		name: process.env.npm_package_name || 'app',
		password: config.get<string>('SERVER_SECRET', (32).string),
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

// Start the application
bootstrap();
