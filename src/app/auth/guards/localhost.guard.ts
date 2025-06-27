import {
	CanActivate,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { IncomingMessage } from 'http';

/** Localhost guard class. */
@Injectable()
export class LocalhostGuard implements CanActivate {
	/**
	 * Check the connection.
	 *
	 * @example
	 *
	 * ```tsEslint
	 * this.canActivate(ctx);
	 * ```
	 *
	 * @param {ExecutionContextHost} context - Request's context.
	 * @returns {boolean} True if context meets all requirements.
	 * @throws {HttpException} Will throw an error if context is non-localhost
	 *   request.
	 */
	canActivate(context: ExecutionContextHost): boolean {
		const req = context.switchToHttp().getRequest(),
			isLocalhost =
				req.hostname === 'localhost' || req.hostname === '127.0.0.1';
		if (!isLocalhost)
			throw new HttpException(
				`Cannot ${context.switchToHttp().getRequest<IncomingMessage>().method} ${context.switchToHttp().getRequest<IncomingMessage>().url}`,
				HttpStatus.NOT_FOUND,
			);
		else return true;
	}
}
