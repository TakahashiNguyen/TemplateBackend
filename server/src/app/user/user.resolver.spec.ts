import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { AppService } from 'app/app.service';
import { GetUsers, Me } from 'graphQL/methods';
import {
	gqlGetUsersQuery,
	gqlGetUsersQueryVariables,
	gqlMeQuery,
	gqlMeQueryVariables,
} from 'graphQL/types';
import { OutgoingHttpHeaders } from 'http';
import { ServerException } from 'utils/error/classes';
import {
	execute,
	getCurrentTestFileName,
	jestInitialization,
	sendGraphQL,
} from 'utils/test/functions';
import { JestInitializationReturns } from 'utils/test/interfaces';
import { SendGraphQLType } from 'utils/test/types';

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

	const foundUser = await svc.user.email(user.email);

	if (!foundUser) throw new ServerException('Invalid', 'User', 'Assign');

	user = foundUser;
});

describe('getUsers', () => {
	let send: SendGraphQLType<gqlGetUsersQuery, gqlGetUsersQueryVariables>;

	beforeAll(() => {
		send = sendGraphQL(req, GetUsers);
	});

	it('success', async () => {
		await execute(
			async () => (await send({ input: {} }, { headers })).getUsers.entities,
			{
				expectations: [
					{
						type: 'toEqual',
						parameters: [
							expect.arrayContaining([
								expect.objectContaining({ name: user.name }),
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
				(await send({ input: { id: user.id } }, { headers })).getUsers.entities,
			{
				expectations: [
					{
						type: 'toEqual',
						parameters: [[expect.objectContaining({ name: user.name })]],
					},
				],
			},
		);
	});

	it('success with name', async () => {
		await execute(
			async () =>
				(await send({ input: { name: user.name } }, { headers })).getUsers
					.entities,
			{
				expectations: [
					{
						type: 'toEqual',
						parameters: [[expect.objectContaining({ name: user.name })]],
					},
				],
			},
		);
	});
});

describe('me', () => {
	let send: SendGraphQLType<gqlMeQuery, gqlMeQueryVariables>;

	beforeAll(() => {
		send = sendGraphQL(req, Me);
	});

	it('success', async () => {
		await execute(async () => (await send({}, { headers })).me, {
			expectations: [
				{
					type: 'toHaveProperty',
					parameters: ['name', user.name],
				},
			],
		});
	});
});
