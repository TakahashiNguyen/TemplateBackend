import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from '@backend/device/device.service';
import { User } from '@backend/user/user.entity';
import { UserService } from '@backend/user/user.service';
import { TestModule } from '@backend/test';
import UAParser from 'ua-parser-js';
import { LogInDto, SignUpDto } from './auth.dto';
import { AuthModule } from './auth.module';
import { AuthService, UserMetadata } from './auth.service';

jest.mock('ua-parser-js');

describe('AuthService', () => {
	const ua = { test: 'test' };

	(UAParser.UAParser as unknown as jest.Mock).mockReturnValue(ua);

	let authSvc: AuthService, usrSvc: UserService, dvcSvc: DeviceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
		}).compile();

		(authSvc = module.get(AuthService)),
			(usrSvc = module.get(UserService)),
			(dvcSvc = module.get(DeviceService));
	});

	it('should be defined', () => expect(authSvc).toBeDefined());

	describe('signup', () => {
		let dto: SignUpDto, mtdt: UserMetadata, usr: User;
		beforeEach(() => {
			(usr = User.test),
				(dto = new SignUpDto({ ...usr } as Required<SignUpDto>)),
				(mtdt = UserMetadata.test);
		});

		it('should create a new user and return tokens', async () => {
			jest.spyOn(usrSvc, 'findOne'),
				jest.spyOn(usrSvc, 'save'),
				jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.signup(dto, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({ email: dto.email }),
				expect(usrSvc.save).toHaveBeenCalledWith(dto),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(expect.any(String), mtdt);
		});

		it('should throw a BadRequestException if the email is already assigned', async () => {
			await authSvc.signup(dto, mtdt);
			await expect(authSvc.signup(dto, mtdt)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('login', () => {
		let dto: LogInDto, mtdt: UserMetadata, usr: User;
		beforeEach(async () => {
			(usr = User.test),
				(dto = new LogInDto({ ...usr } as Required<LogInDto>)),
				(mtdt = UserMetadata.test);
			await authSvc.signup(
				new SignUpDto({ ...usr } as Required<SignUpDto>),
				mtdt,
			);
		});

		it('should return tokens for a valid user', async () => {
			jest.spyOn(usrSvc, 'findOne'), jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.login(dto, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({ email: dto.email }),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(expect.any(String), mtdt);
		});

		it('should throw a BadRequestException for an invalid user', async () => {
			dto.password += '0';
			await expect(authSvc.login(dto, mtdt)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('encrypt and decrypt', () => {
		it('should encrypt and decrypt a string', () => {
			const text = 'hello, world!',
				key = 'my_secret_key',
				encrypted = authSvc.encrypt(text, key),
				decrypted = authSvc.decrypt(encrypted, key);
			expect(decrypted).toEqual(text);
		});
	});
});
