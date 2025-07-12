import { it } from '@jest/globals';
import { AppService } from 'app/app.service';
import { Authentication } from 'app/auth/classes';
import { OutgoingHttpHeaders } from 'http';
import { serverException } from 'utils/error/functions';
import {
	execute,
	getCookies,
	getCurrentTestFileName,
	jestInitialization,
	submitWithFile,
} from 'utils/test/functions';
import { JestInitializationReturns } from 'utils/test/interfaces';

import { UserLogin, UserSignupDto } from './user.dto';
import { User } from './user.entity';

const unit = getCurrentTestFileName(__filename);

let req: JestInitializationReturns['requester'],
	user: User,
	svc: AppService,
	headers: OutgoingHttpHeaders;

beforeAll(async () => {
	const { appService, requester } = await jestInitialization();

	svc = appService;
	req = requester;
});

beforeEach(() => {
	user = new User(User.test(unit, {}));
});

describe('signup', () => {
	const url = '/user/signup';

	let input: UserSignupDto;

	beforeEach(() => {
		input = {
			...user,
			urlManageNotifications: '',
			urlVisit: '',
		};
	});

	it(
		'success',
		async () => {
			await execute(
				async () =>
					(
						await req({
							method: 'post',
							url,
							...submitWithFile(input, 'avatar'),
						})
					).body,
				{
					expectations: [
						{
							type: 'toMatch',
							parameters: [serverException('Success', 'User', 'Assign')],
						},
					],
				},
			);

			await execute(() => svc.user.email(user.email), {
				expectations: [{ type: 'toBeDefined', parameters: [] }],
			});

			await execute(
				async () =>
					svc.bloc.find({
						owner: { email: user.email.lower },
						cache: false,
					}),
				{ expectations: [{ type: 'toHaveLength', parameters: [1] }] },
			);
		},
		(100).m2s,
	);

	it('fail due to email already exist', async () => {
		await req().post(url).body(input);

		await execute(async () => (await req().post(url).body(input)).body, {
			expectations: [
				{
					type: 'toContain',
					parameters: [serverException('Invalid', 'Email', 'Assign')],
				},
			],
		});
	});
});

describe('login', () => {
	const url = '/user/login';

	let input: UserLogin;

	beforeEach(async () => {
		const signupInput: UserSignupDto = {
			...user,
			urlVisit: '',
			urlManageNotifications: '',
		};

		input = {
			...user,
			authentication: { type: 'password', ...user.authentication },
		};

		await req().post('/user/signup').body(signupInput);
	});

	it('success', async () => {
		await execute(async () => (await req().post(url).body(input)).body, {
			expectations: [
				{
					type: 'toMatch',
					parameters: [serverException('Success', 'User', 'Access')],
				},
			],
		});

		await execute(
			async () =>
				svc.bloc.find({
					owner: { email: user.email.lower },
					cache: false,
				}),
			{ expectations: [{ type: 'toHaveLength', parameters: [2] }] },
		);
	});

	it('fail due to wrong password', async () => {
		input = {
			...user,
			authentication: {
				...new Authentication(Authentication.test({})),
				type: 'password',
			},
		};

		await execute(async () => (await req().post(url).body(input)).body, {
			expectations: [
				{
					type: 'toMatch',
					parameters: [serverException('Invalid', 'Authentication', 'Submit')],
				},
			],
		});
	});

	it('fail due to invalid email', async () => {
		const input: UserLogin = {
			...user,
			authentication: { type: 'password', ...user.authentication },
			email: (20).string,
		};

		await execute(async () => (await req().post(url).body(input)).body, {
			expectations: [
				{
					type: 'toContain',
					parameters: [serverException('Invalid', 'Email', 'Submit')],
				},
			],
		});
	});
});

describe('logout', () => {
	const url = '/user/logout';

	beforeEach(async () => {
		const signupInput: UserSignupDto = {
			...user,
			urlVisit: '',
			urlManageNotifications: '',
		};

		({ headers } = await req().post('/user/signup').body(signupInput));
	});

	it('success', async () => {
		await execute(
			async () => (await req().post(url).cookies(getCookies(headers))).body,
			{
				expectations: [
					{
						type: 'toMatch',
						parameters: [serverException('Success', 'User', 'LogOut')],
					},
				],
				onFinish: async () => {
					await execute(
						async () =>
							svc.bloc.find({
								owner: { email: user.email.lower },
								cache: false,
							}),
						{ expectations: [{ type: 'toHaveLength', parameters: [0] }] },
					);
				},
			},
		);
	});

	it('fail due to not have valid cookies', async () => {
		await execute(async () => (await req().post(url)).body, {
			expectations: [
				{
					type: 'toContain',
					parameters: [serverException('Unauthorized', 'User', 'Access')],
				},
			],
		});
	});
});
