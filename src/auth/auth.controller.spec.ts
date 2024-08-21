import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import { DeviceService, UserRecieve } from '@backend/device/device.service';
import { User } from '@backend/user/user.entity';
import { TestModule } from '@backend/test';
import { AuthController } from './auth.controller';
import { LogInDto, SignUpDto } from './auth.dto';
import { AuthMiddleware } from './auth.middleware';
import { AuthModule } from './auth.module';
import { AuthService, UserMetadata } from './auth.service';

describe('AuthauthCon', () => {
	const { email, password, firstName, lastName } = User.test;

	let authCon: AuthController,
		authSvc: AuthService,
		dvcSvc: DeviceService,
		authMdw: AuthMiddleware,
		cfgSvc: ConfigService,
		req: Request,
		res: Response,
		acsKey: string,
		rfsKey: string,
		ckiSfx: string;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AuthModule, TestModule],
		}).compile();

		(authCon = module.get(AuthController)),
			(cfgSvc = module.get(ConfigService)),
			(authSvc = module.get(AuthService)),
			(dvcSvc = module.get(DeviceService)),
			(authMdw = new AuthMiddleware(authSvc, cfgSvc));

		(req = createRequest()),
			(res = createResponse()),
			(acsKey = cfgSvc.get('ACCESS_KEY')),
			(rfsKey = cfgSvc.get('REFRESH_KEY')),
			(ckiSfx = cfgSvc.get('SERVER_COOKIE_PREFIX'));
	});

	it('should be defined', () => expect(authCon).toBeDefined());

	describe('signup', () => {
		it('should call authSvc.signup and sendBack', () => {
			const dto = new SignUpDto({ email, password, lastName, firstName }),
				usrRcv = UserRecieve.test,
				next = async () => {
					jest.spyOn(authSvc, 'signup').mockResolvedValue(usrRcv),
						jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.signup(req, dto, res),
						expect(authSvc.signup).toHaveBeenCalledWith(
							dto,
							expect.any(UserMetadata),
						),
						expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('login', () => {
		it('should call authSvc.login and sendBack', () => {
			const dto = new LogInDto({ email, password }),
				usrRcv = UserRecieve.test,
				next = async () => {
					jest.spyOn(authSvc, 'login').mockResolvedValue(usrRcv),
						jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.login(req, dto, res),
						expect(authSvc.login).toHaveBeenCalledWith(
							dto,
							expect.any(UserMetadata),
						),
						expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('logout', () => {
		it('should clear all cookies and delete device session from databse', async () => {
			req.user = { id: 'a' };

			jest.spyOn(authCon, 'clearCookies').mockImplementation(),
				jest.spyOn(dvcSvc, 'delete').mockImplementation();
			await authCon.logout(req, res),
				expect(authCon.clearCookies).toHaveBeenCalledWith(req, res),
				expect(dvcSvc.delete).toHaveBeenCalledWith({ id: req.user['id'] });
		});
	});

	describe('refresh', () => {
		it('should call dvcSvc.getTokens and sendBack if req.user.success is false', () => {
			const usrRcv = UserRecieve.test,
				next = async () => {
					req.user = { success: false, userId: 'user_id' };

					jest.spyOn(dvcSvc, 'getTokens').mockResolvedValue(usrRcv),
						jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.refresh(req, res),
						expect(dvcSvc.getTokens).toHaveBeenCalledWith(
							req.user['userId'],
							expect.any(UserMetadata),
						),
						expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});

		it('should call sendBack if req.user.success is true and compareSync is true', () => {
			const next = async () => {
				req.user = {
					success: true,
					ua: authSvc.hash(new UserMetadata(req).toString()),
				};

				jest.spyOn(authCon, 'sendBack').mockImplementation();
				await authCon.refresh(req, res),
					expect(authCon.sendBack).toHaveBeenCalledWith(
						req,
						res,
						expect.any(UserRecieve),
					);
			};
			authMdw.use(req, res, next);
		});
	});

	describe('clearCookies', () => {
		it('should call res.clearCookie twice', () => {
			let acs: string, rfs: string;
			req.cookies[`${(acs = ckiSfx + authSvc.hash(acsKey))}`] =
				randomBytes(6).toString();
			req.cookies[`${(rfs = ckiSfx + authSvc.hash(rfsKey))}`] =
				randomBytes(6).toString();

			jest.spyOn(res, 'clearCookie');
			authCon.clearCookies(req, res),
				expect(res['cookies'][acs].value).toBe(''),
				expect(res['cookies'][rfs].value).toBe(''),
				expect(res.clearCookie).toHaveBeenCalledTimes(2);
		});
	});

	describe('sendBack', () => {
		it('should call clearCookies once and res.cookie twice', () => {
			jest.spyOn(authCon, 'clearCookies').mockImplementation(),
				jest.spyOn(res, 'cookie');
			authCon.sendBack(req, res, new UserRecieve('', '')),
				expect(authCon.clearCookies).toHaveBeenCalledWith(req, res),
				expect(res.cookie).toHaveBeenCalledTimes(2),
				expect(res['cookies']).toBeDefined();
		});
	});
});
