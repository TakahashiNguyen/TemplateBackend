import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AllowPublic, RoleGuard, Roles } from '@backend/auth/auth.guard';
import { Role, User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
@UseGuards(RoleGuard)
export class UserResolver {
	constructor(private usrSvc: UserService) {}

	// Queries
	@Query(() => User)
	@AllowPublic(true)
	async findOne(@Args('id') id: string) {
		const user = await this.usrSvc.findOne({ id });
		if (user) return user;
		throw new BadRequestException('User not found');
	}

	@Query(() => [User])
	@Roles([Role.ADMIN, Role.USER])
	findAll() {
		return this.usrSvc.find();
	}
}
