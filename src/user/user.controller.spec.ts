import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createRequest } from 'node-mocks-http';
import { UserController } from './user.controller';
import { User } from './user.entity';

describe('UserController', () => {
	let usrCon: UserController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
		}).compile();

		usrCon = module.get<UserController>(UserController);
	});

	it('should be defined', () => expect(usrCon).toBeDefined());

	describe('getUser', () => {
		it("should return user's infomation", () => {
			const user = User.test,
				req = createRequest({ user });
			expect(usrCon.getUser(req)).toEqual(user.info);
		});

		it('should return error', () => {
			const req = createRequest();
			expect(async () => usrCon.getUser(req)).rejects.toThrow(
				BadRequestException,
			);
		});
	});
});
