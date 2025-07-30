import { Chain } from 'light-my-request';
import { AttributesOnly } from 'utils/app/types';
import { JestInitializationReturns } from 'utils/test/interfaces';

import { UserSignupDto } from './user.dto';
import { User } from './user.entity';

/**
 * User signup function.
 *
 * @example
 *
 * ```ts
 * userSignup(user, input, req);
 * ```
 *
 * @param {User} user - User input.
 * @param {JestInitializationReturns['requester']} req - Server requester.
 * @returns {Chain} Chain response.
 */
export function userSignup(
	user: AttributesOnly<User>,
	req: JestInitializationReturns['requester'],
): Chain {
	const signupInput: UserSignupDto = {
		...user,
		urlVisit: (5).string + '.com',
		urlManageNotifications: (5).string + '.com',
	};

	return req().post('/user/signup').body(signupInput);
}
