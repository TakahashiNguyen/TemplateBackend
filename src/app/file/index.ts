import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDefaultExportFromSubdirectory } from 'utils/app/functions';

import { File } from './file.entity';
import { FileService } from './file.service';

const modules = getDefaultExportFromSubdirectory(__dirname);

/** File module. */
@Module({
	imports: [TypeOrmModule.forFeature([File]), ...modules],
	providers: [FileService],
	exports: [FileService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class FileModule {}
