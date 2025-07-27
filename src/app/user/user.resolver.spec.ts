import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { AppService } from 'app/app.service';
import {
	GetUsersQueryVariables_gql,
	GetUsersQuery_gql,
	GetUsers_gql,
} from 'graphQL/types';
import { OutgoingHttpHeaders } from 'http';
import { ServerException } from 'utils/error/classes';
import { sendGraphQL } from 'utils/graphql/functions';
import {
	execute,
	getCurrentTestFileName,
	jestInitialization,
} from 'utils/test/functions';
import { JestInitializationReturns } from 'utils/test/interfaces';

import { userSignup } from './user.controller.spec.util';
import { User } from './user.entity';

const unit = getCurrentTestFileName(__filename);

let req: JestInitializationReturns['requester'],
	svc: AppService,
	user: User,
	headers: OutgoingHttpHeaders;

beforeAll(async () => {
	const { requester, appService } = await jestInitialization();

	svc = appService;
	req = requester;
});

beforeEach(async () => {
	user = new User(User.test(unit, {}));

	({ headers } = await userSignup(user, req));

	const foundUser = await svc.user.findOne(user);

	if (!foundUser) throw new ServerException('Invalid', 'User', 'Assign');

	user = foundUser;
});

describe('getUsers', () => {
	const send = sendGraphQL<GetUsersQuery_gql, GetUsersQueryVariables_gql>(
		req,
		GetUsers_gql,
	);

	it('success', async () => {
		await execute(
			async () => (await send({ input: {} }, { headers })).getUsers.items,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							expect.arrayContaining([
								expect.objectContaining({
									...employee.eventCreator.user.info,
									lastLogin: expect.anything(),
								}),
							]),
						],
					},
				],
			},
		);
	});

	it('success with id', async () => {
		await execute(
			async () =>
				(await send({ input: { id: employee.id } }, { headers })).getUsers
					.items,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							[
								{
									...employee.eventCreator.user.info,
									lastLogin: expect.anything(),
								},
							],
						],
					},
				],
			},
		);
	});

	it('success with name', async () => {
		await execute(
			async () =>
				(await send({ input: { name: employee.info.user.name } }, { headers }))
					.getUsers.items,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							[
								{
									...employee.eventCreator.user.info,
									lastLogin: expect.anything(),
								},
							],
						],
					},
				],
			},
		);
	});
});

describe('getCurrent', () => {
	const send = sendGraphQL<GetCurrentQuery, GetCurrentQueryVariables>(
		GetCurrent,
	);

	it('success', async () => {
		await execute(async () => (await send({}, { headers })).getCurrent, {
			exps: [
				{
					type: 'toHaveProperty',
					params: ['name', employee.eventCreator.user.baseUser.name],
				},
			],
		});
	});
});
