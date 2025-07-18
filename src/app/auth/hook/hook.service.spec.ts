import { User } from 'app/user/user.entity';
import { UserService } from 'app/user/user.service';
import { Metadata } from 'utils/auth/classes';
import { serverException } from 'utils/error/functions';
import {
	execute,
	getCurrentTestFileName,
	jestInitialization,
} from 'utils/test/functions';

import { IMetadata } from '../guards';
import { Hook } from './hook.entity';
import { HookService } from './hook.service';

const unit = getCurrentTestFileName(__filename);

let userService: UserService, hookService: HookService, metadata: IMetadata;

beforeAll(async () => {
	const { appService, module } = await jestInitialization();

	userService = appService.user;
	hookService = module.get(HookService);
});

beforeEach(() => {
	metadata = Metadata.test();
});

describe('assign', () => {
	it('success', async () => {
		const user = await userService.create(User.test(unit, {}));

		await execute(() => hookService.create(metadata, () => user), {
			expectations: [{ type: 'toBeDefined', parameters: [] }],
			onFinish: async ({ id }) => {
				await execute(() => hookService.findOne({ owner: { id: user.id } }), {
					expectations: [
						{ type: 'toBeDefined', parameters: [] },
						{ type: 'toHaveProperty', parameters: ['id', id] },
					],
				});
			},
		});
	});
});

describe('validating', () => {
	let hook: Hook, signature: string;

	beforeEach(async () => {
		hook = await hookService.create(metadata, (s: string) => {
			signature = s;
			return userService.create(User.test(unit, {}));
		});
	});

	it('success', async () => {
		await execute(() => hookService.validating(hook, metadata, signature), {
			expectations: [{ type: 'toThrow', not: true, parameters: [] }],
		});
	});

	it('failed due to invalid signature', async () => {
		await execute(
			() => hookService.validating(hook, metadata, signature + '!'),
			{
				expectations: [
					{
						type: 'toThrow',
						parameters: [serverException('Invalid', 'Hook', 'Request')],
					},
				],
			},
		);
	});

	it('failed due to invalid metadata', async () => {
		await execute(
			() => hookService.validating(hook, Metadata.test(), signature),
			{
				expectations: [
					{
						type: 'toThrow',
						parameters: [serverException('Invalid', 'Hook', 'Request')],
					},
				],
			},
		);
	});
});
