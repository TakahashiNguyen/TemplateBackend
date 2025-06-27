import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UserRole } from './user.model';

/** User module class. */
@Module({
	imports: [TypeOrmModule.forFeature([User])],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class UserModule {
	/** Initiatialize user module. */
	constructor() {
		registerEnumType(UserRole);
	}
}
