import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import { TestModule } from '@backend/test';
import uaParserJs from 'ua-parser-js';
import { AuthMiddleware, generateFingerprint } from './auth.middleware';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

jest.mock('ua-parser-js');

describe('AuthMiddleware', () => {
	const ua = { test: 'test' },
		acsTkn = '..access-token',
		rfsTkn = 'refresh-token';

	(uaParserJs.UAParser as unknown as jest.Mock).mockReturnValue(ua);

	let next: NextFunction,
		req: Request,
		res: Response,
		authMdw: AuthMiddleware,
		authSvc: AuthService,
		cfgSvc: ConfigService,
		acsKey: string,
		rfsKey: string,
		ckiSfx: string;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
			providers: [AuthMiddleware],
		}).compile();

		(authMdw = module.get(AuthMiddleware)),
			(authSvc = module.get(AuthService)),
			(cfgSvc = module.get(ConfigService));

		(req = createRequest()),
			(res = createResponse()),
			(next = jest.fn()),
			(acsKey = cfgSvc.get('ACCESS_KEY')),
			(rfsKey = cfgSvc.get('REFRESH_KEY')),
			(ckiSfx = cfgSvc.get('SERVER_COOKIE_PREFIX'));
	});

	it('should be defined', () => expect(authMdw).toBeDefined());

	describe('generateFingerprint', () => {
		it('should generate a fingerprint object', () => {
			expect(generateFingerprint()).toEqual({
				userAgent: ua,
			});
		});
	});

	describe('use', () => {
		beforeEach(() => {
			req.cookies[`${ckiSfx + authSvc.hash(rfsKey)}`] = authSvc.encrypt(
				rfsTkn,
				acsTkn.split('.')[2],
			);
			req.cookies[`${ckiSfx + authSvc.hash(acsKey)}`] = authSvc.encrypt(acsTkn);
		});

		it('should set the request fingerprint and authorization header for refresh', () => {
			req.url = '/auth/refreshToken';
			authMdw.use(req, res, next),
				expect(req.headers.authorization).toBe(`Bearer ${rfsTkn}`),
				expect(next).toHaveBeenCalled();
		});

		it('should set the request fingerprint and authorization header for access', () => {
			authMdw.use(req, res, next),
				expect(req.headers.authorization).toBe(`Bearer ${acsTkn}`),
				expect(next).toHaveBeenCalled();
		});
	});
});
