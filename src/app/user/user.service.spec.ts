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

it('create', async () => {
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

it(
	'update',
	async () => {
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
	},
	(100).s2ms,
);
