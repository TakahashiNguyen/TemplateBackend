import { Directive } from '@nestjs/graphql';
import { DocumentNode, print } from 'graphql';
import { getCookies, submitWithFiles } from 'utils/test/functions';
import { JestInitializationReturns } from 'utils/test/interfaces';

import { CacheControlOptions } from './interfaces';
import { SendGraphQLType } from './types';

/**
 * Decorator to apply cache control settings to GraphQL fields.
 *
 * @example
 *
 * ```ts
 * CacheControl({ maxAge: 60, scope: 'PRIVATE' });
 * Field(() => String);
 * name: string;
 * ```
 *
 * @param {CacheControlOptions} options - The cache control options.
 * @returns {ReturnType<typeof Directive>} A GraphQL directive with the
 *   specified cache control settings.
 */
export function CacheControl(
	options: CacheControlOptions,
): ReturnType<typeof Directive> {
	const { maxAge, scope = 'PRIVATE', inheritMaxAge } = options,
		args = [
			`scope: ${scope}`,
			maxAge !== undefined ? `maxAge: ${maxAge}` : null,
			inheritMaxAge ? `inheritMaxAge: ${inheritMaxAge}` : null,
		]
			.filter(Boolean)
			.join(', ');

	return Directive(`@cacheControl(${args})`);
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
