import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from 'app/user/user.model';
import { FastifyRequest } from 'fastify';
import { IResult } from 'ua-parser-js';

/**
 * Convert context's request to graphql's request.
 *
 * @example
 *
 * ```ts
 * const convertedContext = convertForGql(ctx);
 * ```
 *
 * @param {ExecutionContext} context - Context's request.
 * @returns {FastifyRequest} Fastify request interface.
 */
// ! Cautious: Since using GraphQL, it's NOT recommend to DELETE this.
export function convertForGql(context: ExecutionContext): FastifyRequest {
	const { req, request } = GqlExecutionContext.create(context).getContext();
	return req || request;
}

/** Global metadata type. */
export type IMetadata = IResult;

/**
 * @ignore Decorators ! WARNING: it's must be (data: unknown, context:
 *   ExecutionContext) => {} ! to void error [ExceptionsHandler] Cannot read
 *   properties of undefined (reading 'getType').
 */
export const Allow = Reflector.createDecorator<UserRole[]>(),
	Forbid = Reflector.createDecorator<UserRole[]>(),
	AllowPublic = Reflector.createDecorator<boolean>(),
	GetRequest = createParamDecorator(
		<K extends keyof FastifyRequest>(args: K, context: ExecutionContext) =>
			convertForGql(context)[args],
	),
	GetServerKey = createParamDecorator(
		<K extends keyof FastifyRequest['key']>(
			args: K,
			context: ExecutionContext,
		) => {
			const res = convertForGql(context).key;

			if (!res) return null;

			return res[args];
		},
	);
