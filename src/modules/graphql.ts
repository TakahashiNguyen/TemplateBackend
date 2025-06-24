import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import {
	ApolloFederationDriver,
	ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { GraphQLModule, Int } from '@nestjs/graphql';
import {
	DirectiveLocation,
	GraphQLBoolean,
	GraphQLDirective,
	GraphQLEnumType,
} from 'graphql';
import { cacheDurationMs } from 'utils/app/constants';

/** GraphQL module configuration for NestJS with Apollo Federation. */
export const graphqlModule =
	GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
		driver: ApolloFederationDriver,
		inject: [CACHE_MANAGER],
		useFactory: (cacheManager: Cache) => {
			return {
				// Code first
				autoSchemaFile: { path: 'src/schema.gql', federation: 2 },
				sortSchema: true,
				// Init sandBox
				playground: false,
				includeStacktraceInErrorResponses: false,
				inheritResolversFromInterfaces: false,
				introspection: true,
				// Caching
				cache: {
					get: async (key: string): Promise<string | undefined> => {
						const result = await cacheManager.get<string>(key);

						if (!result) return undefined;

						return result;
					},
					set: (
						key: string,
						value: unknown,
						options: {
							/** Cache time to live. */ ttl: number;
						},
					) => cacheManager.set(key, value, options.ttl.s2ms) as Promise<void>,
					delete: (key: string) => cacheManager.del(key),
				},
				// Fix request context
				context: (...args: unknown[]) => ({ req: args[0], res: args[1] }),
				// Plugins
				plugins: [
					responseCachePlugin({
						sessionId: async (requestContext) =>
							requestContext.request.http?.headers.get('sessionId') || null,
					}),
					ApolloServerPluginCacheControl({
						defaultMaxAge: cacheDurationMs / 1000,
						calculateHttpHeaders: false,
					}),
				],
				// Schema build options
				buildSchemaOptions: {
					directives: [
						new GraphQLDirective({
							name: 'cacheControl',
							args: {
								maxAge: { type: Int },
								scope: {
									type: new GraphQLEnumType({
										name: 'CacheControlScope',
										values: { PUBLIC: {}, PRIVATE: {} },
									}),
								},
								inheritMaxAge: { type: GraphQLBoolean },
							},
							locations: [
								DirectiveLocation.FIELD_DEFINITION,
								DirectiveLocation.OBJECT,
								DirectiveLocation.INTERFACE,
								DirectiveLocation.UNION,
								DirectiveLocation.QUERY,
							],
						}),
					],
				},
			};
		},
	});
