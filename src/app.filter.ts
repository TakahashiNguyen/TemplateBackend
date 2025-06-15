import {
	ArgumentsHost,
	Catch,
	ContextType,
	HttpServer,
	ExceptionFilter,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ServerException } from 'utils/error';

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
	 * @param {ServerException} exception - The exception to handle.
	 * @param {ArgumentsHost} host - The arguments host containing the context of the request.
	 */
	catch(exception: ServerException, host: ArgumentsHost) {
		if ((host.getType() as ContextType | 'graphql') === 'graphql')
			return exception;

		const { message } = exception;

		switch (exception.getStatus()) {
			case 403:
				if (message.includes('csrf')) {
					if (message.includes('secret'))
						exception = new ServerException(
							'Invalid',
							'CsrfCookie',
							'',
							exception,
						);
					else if (message.includes('token'))
						exception = new ServerException(
							'Invalid',
							'CsrfToken',
							'',
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

		if (typeof exception['terminalLogging'] === 'function')
			exception.terminalLogging();

		super.catch(exception, host);
	}
}
