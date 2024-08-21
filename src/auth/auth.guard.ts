import {
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Role, User } from '@backend/user/user.entity';

const matchRoles = (roles: Role[], userRoles: Role[]) =>
	roles.some((i) => userRoles.some((j) => i === j));
export const Roles = Reflector.createDecorator<Role[]>(),
	AllowPublic = Reflector.createDecorator<boolean>();
export class ServerContext extends GqlExecutionContext {
	user: User;
}

@Injectable()
export class RoleGuard extends AuthGuard('access') {
	constructor(private reflector: Reflector) {
		super();
	}

	/**
	 * * Convert context's request to graphql's request
	 * @param {ExecutionContext} context - context's request
	 * @return {GqlExecutionContext} graphql's request
	 * ! Cautious: Since using GraphQL, it's NOT recommend to DELETE this
	 */
	getRequest(context: ExecutionContext): ServerContext {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}

	/**
	 * * Check user's role
	 * @param {ExecutionContext} context - context from request
	 * @return {boolean} allow user proceed process
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.get(AllowPublic, context.getHandler())) return true;
		await super.canActivate(context); // ! Must run to check passport
		const roles = this.reflector.get(Roles, context.getHandler());
		if (roles) {
			const req = this.getRequest(context),
				user = req.user;

			return matchRoles(roles, user.roles);
		}
		throw new InternalServerErrorException(
			'Function not defined roles/permissions',
		);
	}
}
