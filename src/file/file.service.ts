import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { extname } from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { DatabaseRequests, FindOptionsWithCustom } from 'utils/typeorm.utils';
import { File } from './file.entity';

@Injectable()
export class FileService extends DatabaseRequests<File> {
	constructor(
		@InjectRepository(File) repo: Repository<File>,
		private cfgSvc: ConfigService,
	) {
		super(repo);
	}

	assign(input: Express.Multer.File, createdBy: User) {
		if (!input?.buffer) return null;

		const path = `${createHash('sha256')
			.update(input.buffer)
			.digest('hex')}${extname(input.originalname)}`;
		writeFileSync(`${this.cfgSvc.get('SERVER_PUBLIC')}${path}`, input.buffer);
		return this.save({ path, createdBy });
	}

	path(input: string, userId: string, options: FindOptionsWithCustom<File>) {
		return this.findOne({ path: input, ...options, createdBy: { id: userId } });
	}
}
