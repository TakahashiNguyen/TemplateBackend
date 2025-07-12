import { OutgoingHttpHeaders } from 'node:http';
import { serverException } from 'utils/error/functions';
import {
	execute,
	getCookies,
	getCurrentTestFileName,
	jestInitialization,
} from 'utils/test/functions';
import { JestInitializationReturns } from 'utils/test/interfaces';

import { UserSignupDto } from './user/user.dto';
import { User } from './user/user.entity';

const unit = getCurrentTestFileName(__filename);

let req: JestInitializationReturns['requester'],
	user: User,
	headers: OutgoingHttpHeaders;

beforeAll(async () => {
	const { requester } = await jestInitialization();

	req = requester;
});

beforeEach(() => {
	user = new User(User.test(unit, {}));
});

describe('refresh', () => {
	const url = '/refresh';

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
						parameters: [serverException('Success', 'Client', 'Request')],
					},
				],
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

	it('success in throw invalid token due to used old token', async () => {
		const oldCookies = getCookies(headers),
			newCookies = getCookies(
				(await req().post(url).cookies(oldCookies)).headers,
			);

		await execute(
			async () => (await req().post(url).cookies(oldCookies)).body,
			{
				expectations: [
					{
						type: 'toMatch',
						parameters: [serverException('Invalid', 'User', 'Access')],
					},
				],
			},
		);

		await execute(
			async () => (await req().post(url).cookies(newCookies)).body,
			{
				expectations: [
					{
						type: 'toMatch',
						parameters: [serverException('Invalid', 'Client', 'Request')],
					},
				],
			},
		);
	});

	it('fail when meta data not match', async () => {
		await execute(
			async () =>
				(
					await req()
						.post(url)
						.headers({
							'user-agent': (18).string,
						})
						.cookies(getCookies(headers))
						.end()
				).body,
			{
				expectations: [
					{
						type: 'toContain',
						parameters: [serverException('Invalid', 'Client', 'Submit')],
					},
				],
			},
		);
	});
});

describe('csrf-token', () => {
	const url = '/csrf-token';

	it('success', async () => {
		await execute(async () => JSON.parse((await req().get(url).end()).body), {
			expectations: [
				{ type: 'toHaveProperty', parameters: ['token', expect.any(String)] },
			],
		});
	});
});
