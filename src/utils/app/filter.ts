import {
	ArgumentsHost,
	Catch,
	ContextType,
	ExceptionFilter,
	HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ErrorObject, ServerException } from 'utils/error';

/**
 * It handles exceptions thrown in the application, particularly focusing on
 * server exceptions.
 */
@Catch()
export class AppExceptionFilter
	extends BaseExceptionFilter
	implements ExceptionFilter
{
	/**
	 * Handles exceptions caught by the filter.
	 *
	 * @example
	 *
	 * ```ts
	 * this.catch(exception, host);
	 * ```
	 *
	 * @param {unknown} exception - The exception to handle.
	 * @param {ArgumentsHost} host - The arguments host containing the context of
	 *   the request.
	 * @returns {unknown} `exception` if the host type is GraphQL.
	 */
	catch(exception: unknown, host: ArgumentsHost): unknown {
		if (host.getType<ContextType | 'graphql'>() === 'graphql') return exception;

		if (exception instanceof HttpException) {
			const { message } = exception;

			switch (exception.getStatus()) {
				case 403:
					if (message.includes('csrf')) {
						let type: ErrorObject;

						switch (true) {
							case message.includes('secret'):
								type = 'CsrfCookie';
								break;
							case message.includes('token'):
								type = 'CsrfToken';
								break;
							default:
								type = 'Client';
								break;
						}

						exception = new ServerException(
							'Invalid',
							type,
							type == 'Client' ? 'Request' : '',
							exception,
						);
					}
					break;

				case 401:
					exception = new ServerException(
						'Unauthorized',
						'User',
						'Access',
						exception,
					);
					break;
			}

			(exception as ServerException).terminalLogging?.();
		}

		super.catch(exception, host);
	}
}
