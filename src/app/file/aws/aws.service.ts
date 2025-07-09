import {
	GetObjectCommand,
	NoSuchKey,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lookup } from 'mime-types';
import { Readable } from 'stream';
import { ServerException } from 'utils/error';

import { AWSRecieve } from './interfaces';

/** AWS service. */
@Injectable()
export class AWSService {
	/**
	 * Initiate aws service.
	 *
	 * @param {ConfigService} config - Config service.
	 */
	constructor(private config: ConfigService) {}

	/** Aws client. */
	private $client!: S3Client;
	/** @ignore */
	get client(): S3Client {
		if (this.$client) return this.$client;

		return (this.$client = new S3Client({
			forcePathStyle: true,
			region: this.config.getOrThrow('AWS_REGION'),
			endpoint: this.config.getOrThrow('AWS_ENDPOINT'),
			credentials: {
				accessKeyId: this.config.getOrThrow('AWS_ACCESS_KEY_ID'),
				secretAccessKey: this.config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
			},
		}));
	}

	/**
	 * Send file to s3 server.
	 *
	 * @example
	 *
	 * ```ts
	 * this.upload('foo', fileReadableOrBuffer);
	 * ```
	 *
	 * @param {string} fileName - The name of sending file.
	 * @param {Readable | Buffer} input - File's buffer to send.
	 */
	async upload(fileName: string, input: Readable | Buffer) {
		try {
			await new Upload({
				client: this.client,
				params: {
					Bucket: this.config.getOrThrow('AWS_BUCKET'),
					Key: fileName,
					Body: input,
					ContentType: lookup(fileName) as string,
				},
			}).done();
		} catch (error) {
			throw new ServerException('Fatal', 'AWS', 'Upload', error as Error);
		}
	}

	/**
	 * Recieve file from s3 server.
	 *
	 * @example
	 *
	 * ```ts
	 * this.download('foo');
	 * ```
	 *
	 * @param {string} filename - The name of recieving file.
	 * @returns {Promise<AWSRecieve>} Recieved file from aws-s3.
	 */
	async download(filename: string): Promise<AWSRecieve> {
		try {
			const result = await this.client.send(
					new GetObjectCommand({
						Bucket: this.config.getOrThrow('AWS_BUCKET'),
						Key: filename,
					}),
				),
				stream = result.Body as Readable,
				length = result.ContentLength,
				type = result.ContentType;

			if (!stream || !length || !type) throw new Error('Lack of infomations');

			return { stream, length, type };
		} catch (error) {
			if (
				error instanceof NoSuchKey ||
				(error as S3ServiceException).name == 'SignatureDoesNotMatch'
			)
				throw new ServerException('Invalid', 'FileName', 'Submit');

			throw new ServerException('Fatal', 'AWS', 'Download', error as Error);
		}
	}
}
