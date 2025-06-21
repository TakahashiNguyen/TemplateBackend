import {
	ArgumentsHost,
	Catch,
	ContextType,
	ExceptionFilter,
	HttpServer,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ErrorObject, ServerException } from 'utils/error';

/**
 * It handles exceptions thrown in the application, particularly focusing on server exceptions.
 * @extends BaseExceptionFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class AppExceptionFilter
	extends BaseExceptionFilter
	implements ExceptionFilter
{
	/**
	 * Creates an instance of AppExceptionFilter.
	 * @param {HttpServer} applicationRef - The HTTP server reference.
	 * @example
	 * const appExceptionFilter = new AppExceptionFilter(httpServer);
	 */
	constructor(applicationRef: HttpServer) {
		super(applicationRef);
	}

	/**
	 * Handles exceptions caught by the filter.
	 * It checks the type of the host and modifies the exception based on its status.
	 * If the exception is a ServerException, it modifies the message based on the status code.
	 * @param {unknown} exception - The exception to handle.
	 * @param {ArgumentsHost} host - The arguments host containing the context of the request.
	 */
	catch(exception: unknown, host: ArgumentsHost) {
		if (host.getType<ContextType | 'graphql'>() === 'graphql') return exception;

		if (exception instanceof ServerException) {
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
