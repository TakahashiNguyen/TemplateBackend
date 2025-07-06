import { beforeEach, describe, it } from '@jest/globals';
import { User } from 'app/user/user.entity';
import { UserService } from 'app/user/user.service';
import { serverException } from 'utils/error/functions';
import { stream2buffer } from 'utils/file/functions';
import {
	execute,
	getCurrentTestFileName,
	jestInitialization,
} from 'utils/test/functions';

import { File } from './file.entity';
import { FileService } from './file.service';

const unit = getCurrentTestFileName(__filename);

let userService: UserService, user: User, fileService: FileService;

beforeAll(async () => {
	const { appService, module } = await jestInitialization();

	userService = appService.user;
	fileService = module.get(FileService);
});

beforeEach(async () => {
	user = await userService.create(User.test(unit, {}));
});

describe('create', () => {
	let originalname: string;

	beforeEach(() => {
		originalname = unit + '_' + (5).string + '.png';
	});

	it('success', async () => {
		const buffer = Buffer.from((40).string, 'base64');

		await execute(
			async () => fileService.create({ buffer, originalname }, user),
			{
				expectations: [{ type: 'toBeInstanceOf', parameters: [File] }],
				onFinish: async ({ id }) => {
					await execute(
						() => fileService.findOne({ id, owner: { id: user.id } }),
						{ expectations: [{ type: 'toBeDefined', parameters: [] }] },
					);
				},
			},
		);
	});

	it('fail when recieved invalid buffer', async () => {
		await execute(
			// @ts-expect-error testing purpose
			async () => fileService.create({ buffer: null, originalname }, user),
			{
				expectations: [
					{
						type: 'toThrow',
						parameters: [serverException('Invalid', 'File', 'Submit')],
					},
				],
			},
		);
	});
});

describe('recieve', () => {
	let path: string, originalname: string, buffer: Buffer;

	beforeEach(async () => {
		buffer = Buffer.from((40).string, 'base64');
		originalname = unit + '_' + (5).string + '.png';

		path = (await fileService.create({ buffer, originalname }, user)).path;
	});

	it('success', async () => {
		await execute(
			async () =>
				await stream2buffer((await fileService.recieve(path, user.id)).stream),
			{
				expectations: [{ type: 'toEqual', parameters: [buffer] }],
			},
		);
	});

	it('fail when accessing forbidden file', async () => {
		await execute(
			async () =>
				await stream2buffer(
					(
						await fileService.recieve(
							path,
							(await userService.create(User.test(unit, {}))).id,
						)
					).stream,
				),
			{
				expectations: [
					{
						type: 'toThrow',
						parameters: [serverException('Forbidden', 'File', 'Access')],
					},
				],
			},
		);
	});
});
