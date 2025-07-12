import { it } from '@jest/globals';
import { UserSignupDto } from 'app/user/user.dto';
import { User } from 'app/user/user.entity';
import { UserService } from 'app/user/user.service';
import { OutgoingHttpHeaders } from 'http';
import {
	execute,
	getCookies,
	getCurrentTestFileName,
	jestInitialization,
	submitWithFile,
} from 'utils/test/functions';
import { JestInitializationReturns } from 'utils/test/interfaces';

const unit = getCurrentTestFileName(__filename);

let user: User,
	req: JestInitializationReturns['requester'],
	userService: UserService;

beforeAll(async () => {
	const { appService, requester } = await jestInitialization();

	req = requester;
	userService = appService.user;
});

describe('seeUploadedFile', () => {
	let headers: OutgoingHttpHeaders, fileContent: string;

	beforeEach(async () => {
		const testUser = User.test(unit, {}),
			{
				body,
				headers: submitHeaders,
				fileContent: receivedFileContent,
			} = submitWithFile(
				{
					...testUser,
					urlManageNotifications: '',
					urlVisit: '',
				} as UserSignupDto,
				'avatar',
			),
			{ headers: receivedHeaders } = await req({
				method: 'post',
				url: '/user/signup',
				body,
				headers: submitHeaders,
			});

		user = await userService.email(testUser.email);
		headers = receivedHeaders;
		fileContent = receivedFileContent;
	});

	it(
		'success',
		async () => {
			await execute(
				async () =>
					(
						await req({
							method: 'get',
							url: `/file/${user.avatarPath}`,
							cookies: getCookies(headers),
						})
					).body,
				{
					expectations: [
						{
							type: 'toEqual',
							parameters: [fileContent],
						},
					],
				},
			);
		},
		(100).s2ms,
	);
});
