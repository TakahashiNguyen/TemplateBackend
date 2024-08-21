import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpDto } from '@backend/auth/auth.dto';
import { AuthModule } from '@backend/auth/auth.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { TestModule } from './test.module';

describe('AppController (e2e)', () => {
	let app: INestApplication, req: TestAgent;
	const payload: SignUpDto = {
		firstName: 'a',
		lastName: 'a',
		email: 'a@a.gmail.com',
		password: 'a',
	};

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		await app.init();
		req = request(app.getHttpServer());
	});

	it('/auth/signup (POST)', () =>
		req.post('/auth/signup').send(payload).expect(201));

	it('/auth/login (POST)', async () =>
		req.post('/auth/login').send(payload).expect(201));
});
