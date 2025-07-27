import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'app/user/user.entity';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { FileUpload } from 'graphql-upload-ts';
import { createHmac } from 'node:crypto';
import { Repository } from 'typeorm';
import { RequireOnlyOne } from 'utils/app/types';
import { ServerException } from 'utils/error/classes';
import { stream2buffer } from 'utils/file/functions';
import { DatabaseRequests } from 'utils/typeorm/classes';

import { AWSService } from './aws/aws.service';
import { AWSReceive } from './aws/interfaces';
import { File } from './file.entity';

/** File services. */
@Injectable()
export class FileService extends DatabaseRequests<typeof File> {
	/**
	 * Initiate file service.
	 *
	 * @param {Repository<File>} repo - Entity repo.
	 * @param {AWSService} aws - Aws service.
	 * @param {ConfigService} cfg - Server config service.
	 */
	constructor(
		@InjectRepository(File) repo: Repository<File>,
		@Inject(forwardRef(() => AWSService)) private aws: AWSService,
		protected cfg: ConfigService,
	) {
		super(repo, File);
	}

	/**
	 * Receive file from server.
	 *
	 * @example
	 *
	 * ```ts
	 * this.receive(filename, userId);
	 * ```
	 *
	 * @param {string} path - Path of receiving file.
	 * @param {string} userId - The id of user want to receive file.
	 * @returns {Promise<AWSReceive>} Received file from aws-s3.
	 */
	async receive(path: string, userId: string): Promise<AWSReceive> {
		if (await this.findOne({ path, owner: { id: userId } }))
			return this.aws.download(path);

		throw new ServerException('Forbidden', 'File', 'Access');
	}

	/**
	 * Convert graphql upload to Express.Multer.File.
	 *
	 * @example
	 *
	 * ```ts
	 * this.GQLUploadToMulterFile(graphqlFile);
	 * ```
	 *
	 * @param {FileUpload} input - Graphql upload.
	 * @returns {Promise<MulterFile>} A converted graphql upload file.
	 */
	GQLUploadToMulterFile({
		createReadStream,
		filename,
		fieldName,
		mimetype,
		encoding,
	}: FileUpload): MulterFile {
		const uploadFile: MulterFile = {
			fieldname: fieldName,
			encoding: encoding,
			mimetype: mimetype,
			stream: createReadStream(),
			filename: filename,
			buffer: undefined,
			originalname: filename,
			size: undefined,
			destination: undefined,
			path: undefined,
		};

		return uploadFile;
	}

	/**
	 * Assign file to server.
	 *
	 * @example
	 *
	 * ```ts
	 * this.create({ buffer, stream, originalname }, owner);
	 * ```
	 *
	 * @param {RequireOnlyOne<
	 * 			Pick<MulterFile, 'stream' | 'buffer' | 'originalname'>,
	 * 			'stream' | 'buffer'
	 * 	  >
	 * 	| MulterFile} file
	 *   - Uploading file input.
	 *
	 * @param {User} owner - The file's owner.
	 * @returns {Promise<File>} An uploaded file.
	 */
	async create(
		{
			buffer,
			stream,
			originalname,
		}:
			| RequireOnlyOne<
					Pick<MulterFile, 'stream' | 'buffer' | 'originalname'>,
					'stream' | 'buffer'
			  >
			| MulterFile,
		owner: User,
	): Promise<File> {
		buffer = buffer || (stream ? await stream2buffer(stream) : undefined);

		if (!buffer) throw new ServerException('Invalid', 'File', 'Submit');

		const title = originalname,
			path = `${createHmac('sha256', this.cfg.getOrThrow('SERVER_SECRET')).update(buffer).digest('base64url')}`;

		await this.aws.upload(path, buffer);

		return this.$create({ path, title, owner });
	}

	/**
	 * Updating file.
	 *
	 * @deprecated Due to disallow updating file.
	 * @example
	 *
	 * ```ts
	 * this.update();
	 * ```
	 *
	 * @returns {Promise<void>}
	 */
	public update(): Promise<void> {
		return Promise.resolve();
	}
}
