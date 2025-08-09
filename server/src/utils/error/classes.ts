import { HttpException } from '@nestjs/common';
import { colorLogging } from 'utils/log/functions';

import { serverException } from './functions';
import { ErrorAction, ErrorObject, ErrorType } from './types';

/**
 * This class extends the HttpException class and is used to handle both
 * server-side and client-side errors.
 *
 * @extends {HttpException}
 */
export class ServerException extends HttpException {
	/**
	 * Creates an instance of ServerException.
	 *
	 * @example
	 *
	 * ```ts
	 * const error = new ServerException('Invalid', 'Client', 'Request');
	 * ```
	 *
	 * @param {ErrorType} type - The type of error (e.g., 'Invalid', 'Success').
	 * @param {ErrorObject} object - The object related to the error (e.g.,
	 *   'Client', 'Server').
	 * @param {ErrorAction} action - The action that caused the error (e.g.,
	 *   'Request', 'Sent').
	 * @param {HttpException | Error} err - An optional HttpException instance
	 *   that provides additional error details.
	 */
	constructor(
		type: ErrorType,
		object: ErrorObject,
		action: ErrorAction,
		private err: HttpException | Error = new Error('Unexpected error'),
	) {
		super(
			(6).string + '_' + serverException(type, object, action),
			err instanceof HttpException ? err.getStatus() : 500,
		);
	}

	/**
	 * This method logs the error details to the terminal. It formats the error
	 * information with colors for better visibility.
	 *
	 * @example
	 *
	 * ```ts
	 * const error = new ServerException('Database', 'Connection', 'Failed');
	 * error.terminalLogging();
	 * ```
	 */
	terminalLogging() {
		const { cause, message, stack } = this.err,
			title = `${'-'.repeat(6)}${this.message}-${this.getStatus()}${'-'.repeat(6)}`;

		console.error(
			colorLogging({ bg: 'bgRed', msg: title }) +
				'\n' +
				colorLogging({
					font: 'yellow',
					msg: `\tCause: ${cause}\n\tMessage: ${message}\n\tStack: ${stack}`,
				}) +
				'\n',
		);
	}
}
