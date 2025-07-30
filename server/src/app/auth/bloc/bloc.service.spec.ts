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
import { Bloc } from './bloc.entity';
import { BlocService } from './bloc.service';

const unit = getCurrentTestFileName(__filename);

let blocService: BlocService,
	userService: UserService,
	owner: User,
	metadata: IMetadata;

beforeAll(async () => {
	const { appService, module } = await jestInitialization();

	metadata = Metadata.test();
	blocService = module.get(BlocService);
	userService = appService.user;
});

beforeEach(async () => {
	owner = await userService.create(User.test(unit, {}));
});

describe('create', () => {
	it('success', async () => {
		await execute(() => blocService.create({ metadata, owner }), {
			expectations: [{ type: 'toBeDefined', parameters: [] }],
			onFinish: async () => {
				await execute(() => blocService.findOne({ owner: { id: owner.id } }), {
					expectations: [{ type: 'toBeDefined', parameters: [] }],
				});
			},
		});
	});

	it('success when chaining', async () => {
		const { currentHash } = await blocService.create({ owner, metadata });

		await execute(() => blocService.create({ currentHash, owner }), {
			expectations: [{ type: 'toThrow', not: true, parameters: [] }],
			onFinish: async ({ id }) => {
				await execute(
					() => blocService.findOne({ previousHash: currentHash, id }),
					{
						expectations: [{ type: 'toBeDefined', parameters: [] }],
					},
				);
			},
		});
	});

	it('fail when providing null metadata', async () => {
		// @ts-expect-error testing purpose
		await execute(() => blocService.create({ owner, metadata: undefined }), {
			expectations: [
				{
					type: 'toThrow',
					parameters: [serverException('Invalid', 'Client', 'Submit')],
				},
			],
		});
	});
});

describe('removeTree', () => {
	const length = 2 + (10).random,
		blocs: Bloc[] = Array.from({ length });

	beforeEach(async () => {
		blocs[0] = await blocService.create({ metadata, owner });

		for (let i = 1; i < length; i++)
			blocs[i] = await blocService.create({
				currentHash: blocs[i - 1].currentHash,
				owner,
			});
	});

	it('success when deleting root', async () => {
		await execute(() => blocService.removeTree({ id: blocs[0].id }), {
			expectations: [{ type: 'toThrow', not: true, parameters: [] }],
		});

		await execute(() => blocService.id(blocs[0].id), {
			expectations: [{ type: 'toBeNull', parameters: [] }],
		});

		await execute(() => blocService.id(blocs[length - 1].id), {
			expectations: [{ type: 'toBeNull', parameters: [] }],
		});
	});

	it('success when deleting treetop', async () => {
		await execute(() => blocService.removeTree({ id: blocs[length - 1].id }), {
			expectations: [{ type: 'toThrow', not: true, parameters: [] }],
		});

		await execute(() => blocService.id(blocs[0].id), {
			expectations: [{ type: 'toBeNull', parameters: [] }],
		});

		await execute(() => blocService.id(blocs[length - 1].id), {
			expectations: [{ type: 'toBeNull', parameters: [] }],
		});
	});

	it('success when deleting body element', async () => {
		await execute(
			() => blocService.removeTree({ id: blocs[1 + (length - 2).random].id }),
			{
				expectations: [{ type: 'toThrow', not: true, parameters: [] }],
			},
		);

		await execute(() => blocService.id(blocs[0].id), {
			expectations: [{ type: 'toBeNull', parameters: [] }],
		});

		await execute(() => blocService.id(blocs[length - 1].id), {
			expectations: [{ type: 'toBeNull', parameters: [] }],
		});
	});

	it('fail when providing mismatch input', async () => {
		// @ts-expect-error testing purpose
		await execute(() => blocService.removeTree({}), {
			expectations: [
				{
					type: 'toThrow',
					parameters: [serverException('Invalid', 'Input', 'Submit')],
				},
			],
		});
	});
});
