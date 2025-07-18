import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Bloc } from 'app/auth/bloc/bloc.entity';
import { GetRequest } from 'app/auth/guards';
import { FileGuard } from 'app/auth/guards/file.guard';
import type { FastifyReply } from 'fastify';

import { FileService } from './file.service';

/** File controller class. */
@Controller({ version: '1', path: 'file' })
export class FileController {
	/**
	 * Initiate file controller.
	 *
	 * @param {FileService} file - File service class.
	 */
	constructor(protected file: FileService) {}

	/**
	 * Get uploaded file.
	 *
	 * @example
	 *
	 * ```ts
	 * this.getFile(filename, res, user);
	 * ```
	 *
	 * @param {string} fileName - The name of file.
	 * @param {FastifyReply} res - The server's response.
	 * @param {User} user - The current processing user.
	 */
	@Get(':filename') @UseGuards(FileGuard) async getFile(
		@Param('filename') fileName: string,
		@Res() res: FastifyReply,
		@GetRequest('bloc') { owner: user }: Bloc,
	) {
		const { stream, type, length } = await this.file.receive(fileName, user.id);

		res
			.headers({ 'content-type': type, 'content-length': length })
			.send(stream);
	}
}
