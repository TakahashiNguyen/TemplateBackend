import { HttpException } from '@nestjs/common';
import { colorLogging } from 'utils/log';

import { ErrorAction, ErrorObject, ErrorType } from '.';

/**
 * This class extends the HttpException class and is used to handle both server-side and client-side errors.
 * @extends HttpException
 */
export class ServerException extends HttpException {
	/**
	 * Creates an instance of ServerException.
	 * @param type - The type of error (e.g., 'Database', 'Network').
	 * @param object - The object related to the error (e.g., 'Connection', 'Request').
	 * @param action - The action that caused the error (e.g., 'Failed', 'Timeout').
	 * @param err - An optional HttpException instance that provides additional error details.
	 * @example
	 * const error = new ServerException('Database', 'Connection', 'Failed');
	 */
	constructor(
		type: ErrorType,
		object: ErrorObject,
		action: ErrorAction,
		private err: HttpException | Error = new Error('Unknown error'),
	) {
		super(
			(6).toString() + '_' + type + '_' + object + (action ? '_' : '') + action,
			err instanceof HttpException ? err.getStatus() : 500,
		);
	}

	/**
	 * This method logs the error details to the terminal.
	 * It formats the error information with colors for better visibility.
	 * @example
	 * const error = new ServerException('Database', 'Connection', 'Failed');
	 * error.terminalLogging();
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
