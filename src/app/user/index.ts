import { Module, forwardRef } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'app';

import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { UserService } from './user.service';

/** User module class. */
@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AppModule)],
	providers: [UserService],
	exports: [UserService],
	controllers: [UserController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class UserModule {
	/** Initialize user module. */
	constructor() {
		registerEnumType(UserRole, { name: 'UserRole' });
	}
}
