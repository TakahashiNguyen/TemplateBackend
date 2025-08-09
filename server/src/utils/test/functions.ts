import { ModuleMetadata, ValidationPipe } from '@nestjs/common';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from 'app/app.service';
import {
	InjectOptions,
	LightMyRequestChain,
	LightMyRequestResponse,
} from 'fastify';
import FormData from 'form-data';
import { DocumentNode, print } from 'graphql';
import { TestModule } from 'modules/test';
import { OutgoingHttpHeaders } from 'node:http';
import { Readable } from 'node:stream';
import { isAsyncFunction } from 'node:util/types';
import { FastifyFramework } from 'utils/app/fastify';
import { AppExceptionFilter } from 'utils/app/filter';
import { IFilesForm } from 'utils/app/interfaces';
import { ServerException } from 'utils/error/classes';

import { JestInitializationReturns } from './interfaces';
import { ExecuteOptions, SendGraphQLType } from './types';

/**
 * Get the current processing file's name with a random postfix.
 *
 * @example
 *
 * ```ts
 * const fileName = getCurrentTestFileName(__filename);
 * ```
 *
 * @param {string} file - Current file name.
 * @returns {string} File's name with a random postfix.
 */
export function getCurrentTestFileName(file: string): string {
	return (
		file
			.split(/\/|\\/)
			.lastElement.split('.')
			.map((w) => w[0].toUpperCase() + w.slice(1))
			.slice(0, 2)
			.join('') +
		'_' +
		(5).string
	);
}

/**
 * Initialize testing modules.
 *
 * @example
 *
 * ```ts
 * jestInitialization();
 * ```
 *
 * @param {ModuleMetadata} opt - Function options.
 * @returns {Promise<JestInitializationReturns>} Attributes and functions for
 *   testing.
 */
export async function jestInitialization(
	opt?: ModuleMetadata,
): Promise<JestInitializationReturns> {
	const module: TestingModule = await Test.createTestingModule({
			imports: (opt?.imports || []).concat(TestModule),
			providers: opt?.providers || [],
			controllers: opt?.controllers || [],
			exports: opt?.exports || [],
		}).compile(),
		appService = module.get(AppService),
		fastifyFramework = new FastifyFramework();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	console.error = (...args: unknown[]) => true;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	console.info = (...args: unknown[]) => true;

	fastifyFramework.testSetup();
	const app = module.createNestApplication<NestFastifyApplication>(
		new FastifyAdapter(fastifyFramework.fastify),
	);

	await app
		.useGlobalPipes(new ValidationPipe())
		.useGlobalFilters(new AppExceptionFilter(app.getHttpAdapter()))
		.init();
	await app.getHttpAdapter().getInstance().ready();

	function requester(): LightMyRequestChain;
	function requester(opt: InjectOptions): Promise<LightMyRequestResponse>;

	/**
	 * Server's testing requester function.
	 *
	 * @example
	 *
	 * ```ts
	 * requester().get('/');
	 * ```
	 *
	 * @param {InjectOptions} [opt] - Function's options.
	 * @returns {LightMyRequestChain | Promise<LightMyRequestResponse>} Base on
	 *   `opt` has passed to the function.
	 */
	function requester(
		opt?: InjectOptions,
	): LightMyRequestChain | Promise<LightMyRequestResponse> {
		return opt ? app.inject(opt) : app.inject();
	}

	return { module, appService, requester };
}

/**
 * A function run async functions and catch both throw errors and results.
 *
 * @example
 *
 * ```ts
 * execute(() => true, {
 * 	expectations: [{ type: 'toHaveReturnedWith', parameters: [true] }],
 * });
 * ```
 *
 * @template R
 * @template K
 * @param {(...args: unknown[]) => Promise<R> | R} func - The function to test.
 * @param {ExecuteOptions<K, R, typeof func>} options
 * @param {number} options.numberOfLoopExecution
 * @param {Expectation<FastifyAdapter, K>[]} options.expectations
 * @param {(result: R) => void | Promise<void>} options.onFinish
 * @param {(func: F) => void | Promise<void>} options.handleLoopExecution
 */
export async function execute<R, K extends keyof jest.Matchers<Promise<R>>>(
	func: (...args: unknown[]) => Promise<R> | R,
	{
		numberOfLoopExecution = 1,
		expectations,
		onFinish,
		handleLoopExecution,
	}: ExecuteOptions<K, R, typeof func>,
) {
	if (!expectations.length)
		throw new ServerException('Fatal', 'Method', 'Implementation');

	if (
		isAsyncFunction(func) &&
		numberOfLoopExecution > 1 &&
		handleLoopExecution != undefined
	)
		await numberOfLoopExecution.range(() => handleLoopExecution(func));

	const executed =
			func instanceof Promise ? func() : (async () => await func())(),
		l1 = expect(executed);

	for (const expectation of expectations) {
		const l2 =
			expectation.type === 'toThrow'
				? expectation.not
					? l1.resolves
					: l1.rejects
				: l1.resolves;
		// @ts-expect-error error-free expression
		await (expectation.not ? l2.not : l2)[expectation.type](
			...expectation.parameters,
		);
	}

	if (onFinish != undefined) await onFinish(await executed);
}

/**
 * Get cookies from headers.
 *
 * @example
 *
 * ```ts
 * getCookies(headers);
 * ```
 *
 * @param {OutgoingHttpHeaders} headers - Input headers.
 * @returns {object} A cookie object from input `headers`.
 */
export function getCookies(headers: OutgoingHttpHeaders): {
	[k: string]: string;
} {
	return Object.fromEntries(
		(() => {
			const cookies = headers['set-cookie'];
			if (!cookies) return [];

			return (Array.isArray(cookies) ? cookies : [cookies])
				.filter(Boolean)
				.map((cookieStr) => {
					const [cookiePair] = decodeURIComponent(cookieStr).split('; ');
					const [key, ...value] = cookiePair.split('=');
					return [key.trim(), value?.join('=').trim()];
				});
		})(),
	);
}

/**
 * Submit with file input.
 *
 * @example
 *
 * ```ts
 * submitWithFiles(body, 'foo');
 * ```
 *
 * @param {{ [k: never]: string | object }} body - Fields to send.
 * @param {{
 * 	[k: string]: {
 * 		fieldName: string;
 * 		content: string;
 * 	};
 * }} files
 *   - Input files.
 *
 * @returns {Pick<InjectOptions, 'payload' | 'headers'>} A form data to send.
 */
export function submitWithFiles(
	// @ts-expect-error error-free expression
	body: { [k: never]: string | object },
	files: IFilesForm,
): Pick<InjectOptions, 'payload' | 'headers'> {
	const form = new FormData(),
		appendObjectFormData = <T>(data: T, parentKey = '') => {
			for (const key in data) {
				const value = data[key];
				const fullKey = parentKey ? `${parentKey}[${key}]` : key;

				if (typeof value === 'object' && value !== null) {
					appendObjectFormData(value, fullKey);
				} else if (value) {
					form.append(fullKey, String(value));
				}
			}
		};

	Object.entries(files).map(([key, value]) => {
		form.append(value.fieldName, Readable.from(Buffer.from(value.content)), {
			filename: key,
		});
	});

	Object.entries(body).map(([key, value]) => {
		if (typeof value === 'object' && value !== null)
			appendObjectFormData(value, key);
		else form.append(key, value);
	});

	return {
		payload: form,
		headers: form.getHeaders(),
	};
}

/**
 * GraphQL query runner.
 *
 * @example
 *
 * ```ts
 * sendGraphQL(query);
 * ```
 *
 * @template T
 * @template K
 * @param {JestInitializationReturns['requester']} requester - Client's
 *   requester.
 * @param {DocumentNode} astQuery - The graphql query.
 * @returns {T} Response from server.
 */
export function sendGraphQL<T, K>(
	requester: JestInitializationReturns['requester'],
	astQuery: DocumentNode,
): SendGraphQLType<T, K> {
	const query = print(astQuery);

	return async (
		variables: K,
		{ headers: inputHeader, map = {}, files = {} },
	): Promise<T> => {
		const body = { query, variables },
			cookies = inputHeader['set-cookie'] ? getCookies(inputHeader) : {};

		Object.values(files).map((value) => {
			map = { ...map, [value.fieldName]: [`variables.${value.fieldName}`] };
		});

		const { payload, headers } = submitWithFiles(
				{
					...{ operations: JSON.stringify(body), map: JSON.stringify(map) },
				},
				files,
			),
			l0 = requester({
				method: 'post',
				url: '/graphql',
				payload,
				headers: {
					...headers,
					'apollo-require-preflight': 'true',
				},
				cookies,
			}),
			{ data, errors } = (await l0).json<{
				/** Response data. */ data: T;
				/** Response errors. */ errors: Error[];
			}>();

		if (!data) throw new Error(errors.map((i) => i.message).join('\n'));

		return data as T;
	};
}
