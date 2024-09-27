import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { execute } from 'utils/test.utils';
import { tstStr } from 'utils/utils';
import { User } from './user.entity';
import { Role } from './user.model';
import { UserModule } from './user.module';

const fileName = curFile(__filename);
let app: INestApplication,
	usr: User,
	req: TestAgent,
	usrRepo: Repository<User>,
	headers: object,
	usrRaw: User;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [UserModule, TestModule],
	}).compile();

	(app = module.createNestApplication()),
		(usrRepo = module.get(getRepositoryToken(User)));

	await app.use(cookieParser()).init();
});

beforeEach(async () => {
	(req = request(app.getHttpServer())),
		(usr = User.test(fileName)),
		({ headers } = await req.post('/auth/signup').send(usr)),
		(usrRaw = await usrRepo.findOne({ where: { email: usr.email } }));
});

describe('findOne', () => {
	it('success', async () => {
		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({
						query: `
							query FindOne($findOneId: String!) {								user(id: $findOneId) {									
							avatarFilePath
							description
									email
									firstName
									lastName
									roles
									avatarFilePath
								}
							}`,
						variables: { findOneId: usrRaw.id },
					}),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: ['text', expect.stringContaining(JSON.stringify(usr.info))],
					},
				],
			},
		);
	});

	it('fail', async () => {
		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({
						query: `
							query FindOne($findOneId: String!) {								user(id: $findOneId) {				avatarFilePath
									description
									email
									firstName
									lastName
									roles
								}
							}`,
						variables: { findOneId: tstStr() },
					}),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: ['text', expect.stringContaining('error')],
					},
				],
			},
		);
	});
});

describe('findAll', () => {
	it('success', async () => {
		await usrRepo.save({ id: usrRaw.id, roles: [Role.ADMIN] });

		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({
						query: `query FindAll {	userAll {	avatarFilePath description
									email
									firstName
									lastName
									roles
								}
							}`,
					}),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'text',
							expect.stringContaining(JSON.stringify(usr.info).slice(1, -10)),
						],
					},
				],
			},
		);
	});
});
