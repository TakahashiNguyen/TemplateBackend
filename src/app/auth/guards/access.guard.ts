import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { roleMatching } from 'utils/auth/functions';
import { ServerException } from 'utils/error/classes';

import { Allow, AllowPublic, Forbid, convertForGraphQl } from '.';

/** Access token guard class. */
@Injectable()
export class AccessGuard extends AuthGuard('access') {
	/**
	 * Initiate access token guard.
	 *
	 * @param {Reflector} reflector - Get method reflector.
	 */
	constructor(private reflector: Reflector) {
		super({ property: 'key.user' });
	}

	/**
	 * Convert client's request to suitable server request format.
	 *
	 * @example
	 *
	 * ```ts
	 * this.getRequest(ctx);
	 * ```
	 *
	 * @param {ExecutionContext} ctx - Client request's context.
	 * @returns {FastifyRequest} Convert to fastify request.
	 */
	getRequest(ctx: ExecutionContext): FastifyRequest {
		return convertForGraphQl(ctx);
	}

	/**
	 * Identify if request is allowed to process.
	 *
	 * @example
	 *
	 * ```ts
	 * this.canActivate(ctx);
	 * ```
	 *
	 * @param {ExecutionContext} context - Request context.
	 * @returns {Promise<boolean>} True if context meets all requirements.
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.get(AllowPublic, context.getHandler())) return true;

		await super.canActivate(context); // ! Must run to check passport

		const allowRoles = this.reflector.get(Allow, context.getHandler()) || [],
			forbidRoles = this.reflector.get(Forbid, context.getHandler()) || [],
			userRole = this.getRequest(context).key.user?.role;

		if (!userRole) throw new ServerException('Invalid', 'User', 'Request');
		else if (allowRoles.some((i) => roleMatching(i, forbidRoles)))
			throw new ServerException('Fatal', 'Method', 'Implementation');
		else if (!allowRoles.length && !forbidRoles.length) return true;

		return (
			(allowRoles.length ? roleMatching(userRole, allowRoles) : true) &&
			!roleMatching(userRole, forbidRoles)
		);
	}
}
