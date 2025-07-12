import { expect } from '@jest/globals';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'app/user/user.entity';
import { UserRole } from 'app/user/user.model';
import { FastifyRequest } from 'fastify';
import { serverException } from 'utils/error/functions';
import {
	execute,
	getCurrentTestFileName,
	jestInitialization,
} from 'utils/test/functions';

import { UserGuard } from './user.guard';

const unit = getCurrentTestFileName(__filename);

let userGuard: UserGuard, reflector: Reflector, context: ExecutionContext;

beforeAll(async () => {
	const { module } = await jestInitialization();

	userGuard = module.get(UserGuard);
	reflector = module.get(Reflector);
	context = {
		getHandler: jest.fn().mockReturnValue({}),
		getClass: jest.fn().mockReturnValue({}),
	} as unknown as ExecutionContext;
});

describe('canActivate', () => {
	/** Default return. */
	const req: FastifyRequest = {
		// @ts-expect-error error-free expression
		bloc: {
			owner: new User(User.test(unit, {})),
		},
	};

	beforeEach(() => {
		jest
			.spyOn(AuthGuard('user').prototype, 'canActivate')
			.mockImplementation(() => true);

		jest.spyOn(userGuard, 'getRequest').mockReturnValueOnce(req);
	});

	it('success when AllowPublic is set', async () => {
		jest.spyOn(reflector, 'get').mockReturnValueOnce(true);

		expect(await userGuard.canActivate(context)).toBe(true);
	});

	it("success when user's role match the allowance roles", async () => {
		jest
			.spyOn(reflector, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.guest])
			.mockReturnValueOnce(null);

		expect(await userGuard.canActivate(context)).toBe(true);
	});

	it("fail when user's role match the forbiddance roles", async () => {
		jest
			.spyOn(reflector, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(null)
			.mockReturnValueOnce([UserRole.guest]);

		expect(await userGuard.canActivate(context)).toBe(false);
	});

	it("fail when user's roles not match the required roles", async () => {
		jest
			.spyOn(reflector, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.admin]);
		expect(await userGuard.canActivate(context)).toBe(false);
	});

	it('success when allowance and forbiddance roles not defined', async () => {
		jest
			.spyOn(reflector, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(null)
			.mockReturnValueOnce(null);

		expect(await userGuard.canActivate(context)).toBe(true);
	});

	it('fail when allowance and forbiddance roles have same child', async () => {
		jest
			.spyOn(reflector, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.admin])
			.mockReturnValueOnce([UserRole.admin]);

		await execute(() => userGuard.canActivate(context), {
			expectations: [
				{
					type: 'toThrow',
					parameters: [serverException('Fatal', 'Method', 'Implementation')],
				},
			],
		});
	});
});
