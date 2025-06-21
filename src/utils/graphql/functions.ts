import { Directive } from '@nestjs/graphql';

import { CacheControlOptions } from './interfaces';

/**
 * Decorator to apply cache control settings to GraphQL fields.
 * @param {CacheControlOptions} options - The cache control options.
 * @returns {ReturnType<typeof Directive>} A GraphQL directive with the specified cache control settings.
 * @example
 * @CacheControl({ maxAge: 60, scope: 'PRIVATE' })
 * @Field(() => String)
 * name: string;
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
