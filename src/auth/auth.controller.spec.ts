import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { Device } from 'device/device.entity';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { execute } from 'utils/test.utils';
import { tstStr } from 'utils/utils';
import { AuthModule } from './auth.module';

const fileName = curFile(__filename);

let dvcRepo: Repository<Device>,
	usrRepo: Repository<User>,
	req: TestAgent,
	usr: User,
	app: INestApplication,
	rfsTms: number;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
			imports: [AuthModule, TestModule],
		}).compile(),
		cfgSvc = module.get(ConfigService);

	(dvcRepo = module.get(getRepositoryToken(Device))),
		(usrRepo = module.get(getRepositoryToken(User))),
		(app = module.createNestApplication()),
		(rfsTms = cfgSvc.get('REFRESH_USE'));

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (usr = User.test(fileName));
});

describe('signup', () => {
	it('success', async () => {
		await execute(() => req.post('/auth/signup').send(usr), {
			exps: [
				{
					type: 'toHaveProperty',
					params: [
						'headers.set-cookie',
						expect.arrayContaining([expect.anything(), expect.anything()]),
					],
				},
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		});

		await execute(() => usrRepo.findOne({ where: { email: usr.email } }), {
			exps: [{ type: 'toBeInstanceOf', params: [User] }],
		});
	});

	it('fail due to email already exist', async () => {
		await req.post('/auth/signup').send(usr);

		await execute(() => req.post('/auth/signup').send(usr), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
	});
});

describe('login', () => {
	beforeEach(async () => await req.post('/auth/signup').send(usr));

	it('success', async () => {
		await execute(() => req.post('/auth/login').send(usr), {
			exps: [
				{
					type: 'toHaveProperty',
					params: [
						'headers.set-cookie',
						expect.arrayContaining([expect.anything(), expect.anything()]),
					],
				},
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		});

		await execute(
			() => dvcRepo.find({ where: { owner: { email: usr.email } } }),
			{ exps: [{ type: 'toHaveLength', params: [2] }] },
		);
	});

	it('fail due to wrong password', async () => {
		usr = new User({ ...usr, password: tstStr() });

		await execute(() => req.post('/auth/login').send(usr), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
	});
});

describe('logout', () => {
	let headers: object;

	beforeEach(
		async () => ({ headers } = await req.post('/auth/signup').send(usr)),
	);

	it('success', async () => {
		await execute(
			() => req.post('/auth/logout').set('Cookie', headers['set-cookie']),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: ['headers.set-cookie', expect.arrayContaining([])],
					},
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
				onFinish: () =>
					execute(
						() => dvcRepo.find({ where: { owner: { email: usr.email } } }),
						{ exps: [{ type: 'toHaveLength', params: [0] }] },
					),
			},
		);
	});

	it('fail due to not have valid cookies', async () => {
		await execute(req.post, {
			params: ['/auth/logout'],
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
			],
		});
	});
});

describe('refresh', () => {
	let headers: object;

	beforeEach(
		async () => ({ headers } = await req.post('/auth/signup').send(usr)),
	);

	it('success', async () => {
		await execute(
			() => req.post('/auth/refresh').set('Cookie', headers['set-cookie']),
			{
				exps: [
					{
						type: 'toHaveProperty',
						not: true,
						params: [
							'headers.set-cookie',
							expect.arrayContaining(headers['set-cookie']),
						],
					},
					{
						type: 'toHaveProperty',
						params: [
							'headers.set-cookie',
							expect.arrayContaining([expect.anything(), expect.anything()]),
						],
					},
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});

	it('fail due to not have valid cookies', async () => {
		await execute(req.post, {
			params: ['/auth/refresh'],
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
			],
		});
	});

	it('success in generate new key', async () => {
		await execute(
			async (headers: object) =>
				({ headers } = await req
					.post('/auth/refresh')
					.set('Cookie', headers['set-cookie'])),
			{
				numOfRun: rfsTms * 1.2,
				params: [headers],
				exps: [
					{
						type: 'toHaveProperty',
						not: true,
						params: [
							'headers.set-cookie',
							expect.arrayContaining(headers['set-cookie']),
						],
					},
					{
						type: 'toHaveProperty',
						params: [
							'headers.set-cookie',
							expect.arrayContaining([expect.anything(), expect.anything()]),
						],
					},
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});
});
