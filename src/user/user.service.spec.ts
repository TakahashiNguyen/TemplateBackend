import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from '@backend/test';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
	let usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, UserModule],
		}).compile();

		usrSvc = module.get(UserService);
	});

	it('should be defined', () => expect(usrSvc).toBeDefined());
});
