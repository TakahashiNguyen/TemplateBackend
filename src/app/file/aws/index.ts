import { Module } from '@nestjs/common';

import { AWSService } from './aws.service';

/** AWS module. */
@Module({
	providers: [AWSService],
	exports: [AWSService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class AWSModule {}
