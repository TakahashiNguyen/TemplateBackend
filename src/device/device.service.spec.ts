import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, UserMetadata } from '@backend/auth/auth.service';
import { User } from '@backend/user/user.entity';
import { UserService } from '@backend/user/user.service';
import { TestModule } from '@backend/test';
import { DeepPartial } from 'typeorm';
import { DeviceModule } from './device.module';
import { DeviceService, UserRecieve } from './device.service';

describe('DeviceService', () => {
	let dvcSvc: DeviceService,
		authSvc: AuthService,
		jwtSvc: JwtService,
		usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, DeviceModule],
		}).compile();

		(dvcSvc = module.get(DeviceService)),
			(authSvc = module.get(AuthService)),
			(jwtSvc = module.get(JwtService)),
			(usrSvc = module.get(UserService));
	});

	it('should be defined', () => expect(dvcSvc).toBeDefined());

	describe('getTokens', () => {
		let mtdt: UserMetadata, usr: DeepPartial<User>;
		beforeEach(async () => {
			(mtdt = UserMetadata.test), (usr = await usrSvc.save(User.test));
		});

		it('should create a new device session and return tokens', async () => {
			const usrRcv = UserRecieve.test;

			jest.spyOn(authSvc, 'hash'),
				jest
					.spyOn(jwtSvc, 'sign')
					.mockReturnValueOnce(usrRcv.refreshToken)
					.mockReturnValueOnce(usrRcv.accessToken);

			const result = await dvcSvc.getTokens(usr.id, mtdt);

			expect(jwtSvc.sign).toHaveBeenCalledTimes(2),
				expect(authSvc.hash).toHaveBeenCalledWith(mtdt.toString()),
				expect(result).toEqual(usrRcv);
		});
	});
});
