import { CookieSerializeOptions } from '@fastify/csrf-protection';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable, OnModuleInit } from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { convertForGraphQl } from 'app/auth/guards';
import { RefreshStrategy } from 'app/auth/guards/refresh.strategy';
import { UserStrategy } from 'app/auth/guards/user.strategy';
import {
	DoneFuncWithErrOrRes,
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from 'fastify';
import { processRequest } from 'graphql-upload-ts';
import { UAParser } from 'ua-parser-js';
import { SecurityService } from 'utils/auth/classes';

import { cookieOptions, fileSizeMaximum } from './constants';
import { UserReceiveDto } from './dto';
import { RequestResponse } from './interfaces';

/** Modified cache interceptor. */
export class ModifiedCacheInterceptor extends CacheInterceptor {
	/**
	 * Check if request context is cacheable.
	 *
	 * @example
	 *
	 * ```ts
	 * this.isRequestCacheable(context);
	 * ```
	 *
	 * @param {ExecutionContext} context - Client's request context.
	 * @returns {boolean} True if request is cacheable.
	 */
	protected isRequestCacheable(context: ExecutionContext): boolean {
		return this.allowedMethods.includes(convertForGraphQl(context).method);
	}

	/**
	 * Function set http headers for caching.
	 *
	 * @example
	 *
	 * ```ts
	 * this.setHeadersWhenHttp(ctx, value);
	 * ```
	 *
	 * @param {ExecutionContext} context - Client's request context.
	 * @param {unknown} value - Checking value.
	 */
	protected setHeadersWhenHttp(
		context: ExecutionContext,
		value: unknown,
	): void {
		if (!this.httpAdapterHost || !this.httpAdapterHost.httpAdapter) return;

		const { httpAdapter } = this.httpAdapterHost;

		const response = GqlExecutionContext.create(context).getContext<{
			/** Fastify response interface. */
			res: FastifyReply;
		}>().res;

		httpAdapter.setHeader(response, 'X-Cache', isNil(value) ? 'MISS' : 'HIT');
	}
}

/** Server initiation class. */
export class ServerInitializationClass implements OnModuleInit {
	/**
	 * Server initialization class.
	 *
	 * @param {HttpAdapterHost} httpAdapterHost - Server's http adapter.
	 * @param {ConfigService} config - Config service.
	 * @param {JwtService} jwt - JSON web token service.
	 */
	constructor(
		protected httpAdapterHost: HttpAdapterHost,
		protected config: ConfigService,
		protected jwt: JwtService,
	) {}

	/**
	 * On module initialization execution.
	 *
	 * @example
	 *
	 * ```ts
	 * this.onModuleInit();
	 * ```
	 */
	onModuleInit() {
		const adapterInstance: FastifyInstance =
				this.httpAdapterHost.httpAdapter.getInstance(),
			middleware = new ServerMiddleware(this.jwt, this.config);

		adapterInstance
			.addHook('preValidation', (req, rep, done) =>
				middleware.auth(req, rep, done),
			)
			.addHook('preValidation', (req, rep) => middleware.setMetadata(req, rep))
			.addHook('preValidation', (req, rep) => middleware.graphQl(req, rep))
			.addHook('preSerialization', (req, rep, payload: UserReceiveDto, done) =>
				middleware.preSerialization(req, rep, payload, done),
			)
			.addHook('onSend', (req, rep, payload, done) =>
				middleware.setCookie(req, rep, payload, done),
			)
			.addHook('onRequest', (request, reply, done) => {
				if (
					request.url == '/graphql' &&
					request.method.toLocaleLowerCase() != 'post'
				)
					reply.callNotFound();
				else done();
			})
			.addContentTypeParser(
				/^multipart\/([\w-]+);?/,
				function (request, payload, done) {
					request.isMultipart = true;

					done(null, request.body);
				},
			);
	}
}

/** App middleware. */
@Injectable()
export class ServerMiddleware extends SecurityService {
	/** Access cookie name. */
	readonly accessCookieName: string = 'access';

	/** Refresh cookie name. */
	readonly refreshCookieName: string = 'refresh';

	/**
	 * Authenticate processing.
	 *
	 * @example
	 *
	 * ```ts
	 * this.auth(req, res, done);
	 * ```
	 *
	 * @param {FastifyRequest} req - Server's request.
	 * @param {FastifyReply} res - Server's response.
	 * @param {DoneFuncWithErrOrRes} done - Fastify's done function.
	 */
	auth(req: FastifyRequest, res: FastifyReply, done: DoneFuncWithErrOrRes) {
		const accessKey = req.session.get('accessKey');

		let access: string = '',
			refresh: string = '';

		for (const cookieName in req.cookies) {
			const { valid, value } = req.unsignCookie(req.cookies[cookieName] || '');

			if (!valid) continue;
			else if (this.refreshCookieName == cookieName)
				refresh = this.decrypt(value);
			else if (this.accessCookieName == cookieName && accessKey)
				access = this.decrypt(value, this.decrypt(accessKey, req.ip));
		}

		req.headers[UserStrategy.header] = access;
		req.headers[RefreshStrategy.header] = refresh;

		delete req.headers.sessionId;
		try {
			if (access && this.verify(access).accessToken)
				req.headers.sessionId = req.session.get('sessionId') || '';
		} catch {
			/* empty */
		}
		done();
	}

	/**
	 * Set metadata current request.
	 *
	 * @example
	 *
	 * ```ts
	 * this.setMetadata(req, res);
	 * ```
	 *
	 * @param {FastifyRequest} req - Server's request.
	 * @param {FastifyReply} res - Server's response.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async setMetadata(req: FastifyRequest, res: FastifyReply) {
		req.metadata = await UAParser(req.headers).withFeatureCheck();
	}

	/**
	 * GraphQL handler.
	 *
	 * @example
	 *
	 * ```ts
	 * this.graphQl(req, res);
	 * ```
	 *
	 * @param {FastifyRequest} req - Server's request.
	 * @param {FastifyReply} res - Server's response.
	 */
	async graphQl(req: FastifyRequest, res: FastifyReply) {
		if (req.url === '/graphql') {
			if (typeof req.isMultipart == 'boolean' && req.isMultipart)
				req.body = await processRequest(req.raw, res.raw, {
					maxFileSize: fileSizeMaximum.mb2b,
				});
		}
	}

	/**
	 * Server's sending cookie function.
	 *
	 * @example
	 *
	 * ```ts
	 * this.setCookie(req, res, payload, done);
	 * ```
	 *
	 * @param {FastifyRequest} req - Server's request.
	 * @param {FastifyReply} res - Server's response.
	 * @param {unknown} payload - Server's payload.
	 * @param {DoneFuncWithErrOrRes} done - Fastify's done function.
	 */
	setCookie(
		req: FastifyRequest,
		res: FastifyReply,
		payload: unknown,
		done: DoneFuncWithErrOrRes,
	) {
		if (!req.bloc) {
			done();
			return;
		}

		const cookieOpts: CookieSerializeOptions = {
				...cookieOptions,
				maxAge: 2 ** 31,
			},
			accessKey = req.session.get('accessKey');

		if (accessKey) {
			res.setCookie(
				this.accessCookieName,
				this.encrypt(
					this.access(req.bloc.currentHash),
					this.decrypt(accessKey, req.ip),
				),
				cookieOpts,
			);
		}

		res.setCookie(
			this.refreshCookieName,
			this.encrypt(this.refresh(req.bloc.id)),
			cookieOpts,
		);

		done(null, payload);
	}

	/**
	 * Server pre-serialization function.
	 *
	 * @example
	 *
	 * ```ts
	 * this.preSerialization(req, rep, payload, done);
	 * ```
	 *
	 * @param {FastifyRequest} req - Server's request.
	 * @param {FastifyReply} res - Server's response.
	 * @param {UserReceiveDto} payload - Server's payload.
	 * @param {DoneFuncWithErrOrRes} done - Fastify's done function.
	 */
	preSerialization(
		req: FastifyRequest,
		res: FastifyReply,
		payload: UserReceiveDto,
		done: DoneFuncWithErrOrRes,
	) {
		const sessionId = req.session.get('sessionId');

		if (!sessionId) req.session.set('sessionId', (64).string);

		if (!(payload instanceof UserReceiveDto)) {
			done();
			return;
		}

		const { bloc, hook, ...rest } = payload,
			accessKey = (32).string;

		req.session.set('accessKey', this.encrypt(accessKey, req.ip));

		req.hook = hook || req.hook;
		req.bloc = bloc || req.bloc;

		done(null, rest);
	}
}

/** Modified throttler guard class. */
export class ModifiedThrottlerGuard extends ThrottlerGuard {
	/**
	 * Handle both GraphQL and RestAPI request, response.
	 *
	 * @example
	 *
	 * ```ts
	 * this.getRequestResponse(context);
	 * ```
	 *
	 * @param {ExecutionContext} context - Client's context.
	 * @returns {RequestResponse} Client's request and response.
	 */
	protected getRequestResponse(context: ExecutionContext): RequestResponse {
		if (context.getType() == 'http') return super.getRequestResponse(context);

		const { res, req } = GqlExecutionContext.create(context).getContext();

		return { req, res };
	}
}
