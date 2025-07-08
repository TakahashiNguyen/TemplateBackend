import {
	BadRequestException,
	CallHandler,
	ExecutionContext,
	HttpException,
	Inject,
	NestInterceptor,
	Optional,
	PayloadTooLargeException,
	Type,
	mixin,
} from '@nestjs/common';
import multer from 'fastify-multer';
import { Options as MulterOptions } from 'fastify-multer/lib/interfaces';
import { Observable } from 'rxjs';

import { busboyExceptions, multerExceptions } from './constances';

/**
 * Convert a stream to buffer.
 *
 * @example
 *
 * ```ts
 * stream2buffer(stream);
 * ```
 *
 * @param {NodeJS.ReadableStream} stream - Input stream.
 * @returns {Promise<Buffer>} A buffer.
 */
export async function stream2buffer(
	stream: NodeJS.ReadableStream,
): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const _buf = Array<never>();

		stream.on('data', (chunk) => _buf.push(chunk as never));
		stream.on('end', () => resolve(Buffer.concat(_buf)));
		stream.on('error', (err) => reject(`error converting stream - ${err}`));
	});
}

/**
 * File interceptor decorator.
 *
 * @example
 *
 * ```ts
 * FileInterceptor();
 * ```
 *
 * @param {string} fieldName - Request body field.
 * @param {MulterOptions} localOptions - Function options.
 * @returns {Type<NestInterceptor>} A nest interceptor.
 * @publicApi
 */
export function FileInterceptor(
	fieldName?: string,
	localOptions?: MulterOptions,
): Type<NestInterceptor> {
	/** Create class. */
	class MixinInterceptor implements NestInterceptor {
		/** Multer field. */
		protected multer: ReturnType<typeof multer>;

		/**
		 * Initialize file interceptor class.
		 *
		 * @param {MulterOptions} options - Class' options.
		 */
		constructor(
			@Optional() @Inject('MULTER_MODULE_OPTIONS') options: MulterOptions = {},
		) {
			this.multer = multer({ ...options, ...localOptions });
		}

		/**
		 * Intercept function.
		 *
		 * @example
		 *
		 * ```ts
		 * this.intercept(context, next);
		 * ```
		 *
		 * @param {ExecutionContext} context - Request context.
		 * @param {CallHandler} next - Next function.
		 * @returns {Promise<Observable<unknown>>} An observable object.
		 */
		async intercept(
			context: ExecutionContext,
			next: CallHandler,
		): Promise<Observable<unknown>> {
			const ctx = context.switchToHttp(),
				multer = this.multer;

			const func = fieldName ? multer.single(fieldName) : multer.none();

			await new Promise<void>((resolve, reject) => {
				// @ts-expect-error error-free expression
				func(ctx.getRequest(), ctx.getResponse(), (err) => {
					if (err) {
						const error = transformException(err);
						return reject(error);
					}
					resolve();
				});
			});

			return next.handle();
		}
	}
	const Interceptor = mixin(MixinInterceptor);
	return Interceptor;
}

/**
 * Transform error to server exception.
 *
 * @example
 *
 * ```ts
 * transformException(error);
 * ```
 *
 * @param {(Error & { field?: string }) | undefined} error - Recieve error.
 * @returns {Error} An error.
 */
export function transformException(
	error:
		| (Error & {
				/** Error field. */ field?: string;
		  })
		| undefined,
): Error {
	if (!error || error instanceof HttpException) {
		return error || new Error('Unknown error');
	}
	switch (error.message) {
		case multerExceptions.LIMIT_FILE_SIZE:
			return new PayloadTooLargeException(error.message);
		case multerExceptions.LIMIT_FILE_COUNT:
		case multerExceptions.LIMIT_FIELD_KEY:
		case multerExceptions.LIMIT_FIELD_VALUE:
		case multerExceptions.LIMIT_FIELD_COUNT:
		case multerExceptions.LIMIT_UNEXPECTED_FILE:
		case multerExceptions.LIMIT_PART_COUNT:
		case multerExceptions.MISSING_FIELD_NAME:
			if (error.field) {
				return new BadRequestException(`${error.message} - ${error.field}`);
			}
			return new BadRequestException(error.message);
		case busboyExceptions.MULTIPART_BOUNDARY_NOT_FOUND:
			return new BadRequestException(error.message);
		case busboyExceptions.MULTIPART_MALFORMED_PART_HEADER:
		case busboyExceptions.MULTIPART_UNEXPECTED_END_OF_FORM:
		case busboyExceptions.MULTIPART_UNEXPECTED_END_OF_FILE:
			return new BadRequestException(`Multipart: ${error.message}`);
	}
	return error;
}
