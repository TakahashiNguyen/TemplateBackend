import { serverException } from 'utils/error/functions';
import {
	execute,
	getCurrentTestFileName,
	jestInitialization,
} from 'utils/test/functions';

import { User } from './user.entity';
import { UserService } from './user.service';

const unit = getCurrentTestFileName(__filename);

let userService: UserService, user: User;

beforeAll(async () => {
	const { module } = await jestInitialization();

	userService = module.get(UserService);
});

beforeEach(() => {
	user = User.test(unit, {});
});

describe('email', () => {
	it('success', async () => {
		const dbUser = await userService.create(user);

		await execute(() => userService.email(dbUser.email), {
			expectations: [{ type: 'toBeDefined', parameters: [] }],
		});
	});

	it('fail when parsing invalid email', async () => {
		await execute(() => userService.email((10).string), {
			expectations: [
				{
					type: 'toThrow',
					parameters: [serverException('Invalid', 'Email', 'Submit')],
				},
			],
		});
	});
});

describe('create', () => {
	it('success', async () => {
		await execute(() => userService.create(user), {
			expectations: [{ type: 'toBeInstanceOf', parameters: [User] }],
			onFinish: async (result: User) => {
				await execute(() => userService.id(result.id), {
					expectations: [
						{
							type: 'toHaveProperty',
							parameters: ['email', result.email],
						},
					],
				});
			},
		});
	});

	it('fail when non-email user assigning', async () => {
		await execute(() => userService.create({ ...user, email: undefined }), {
			expectations: [
				{
					type: 'toThrow',
					parameters: [serverException('Invalid', 'User', 'Assign')],
				},
			],
		});
	});

	it('fail when assigning existed user', async () => {
		await userService.create(user);

		await execute(() => userService.create(user), {
			expectations: [
				{
					type: 'toThrow',
					parameters: [serverException('Invalid', 'Email', 'Assign')],
				},
			],
		});
	});
});

describe('update', () => {
	it('success', async () => {
		const { id: userId } = await userService.create(user),
			newName = (20).string;

		await execute(() => userService.update({ id: userId }, { name: newName }), {
			expectations: [{ type: 'toThrow', not: true, parameters: [] }],
			onFinish: async () => {
				await execute(() => userService.find({ name: newName, cache: false }), {
					expectations: [{ type: 'toHaveLength', parameters: [1] }],
				});
			},
		});
	});

	it('success when updating email', async () => {
		const { id: userId } = await userService.create(user),
			newEmail = (20).string;

		await execute(
			() => userService.update({ id: userId }, { email: newEmail }),
			{
				expectations: [{ type: 'toThrow', not: true, parameters: [] }],
				onFinish: async () => {
					await execute(() => userService.email(newEmail), {
						expectations: [{ type: 'toBeDefined', parameters: [] }],
					});
				},
			},
		);
	});

	it('fail when updating existed email', async () => {
		const { id: userId } = await userService.create(user),
			{ email: newEmail } = await userService.create(
				User.test(unit, { email: (10).string }),
			);

		await execute(
			() => userService.update({ id: userId }, { email: newEmail }),
			{
				expectations: [
					{
						type: 'toThrow',
						parameters: [serverException('Invalid', 'Email', 'Assign')],
					},
				],
			},
		);
	});
});
