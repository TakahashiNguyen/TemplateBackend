import { tstStr } from 'utils/utils';
import { IUserRecieve } from './user.model';

export class UserRecieve implements IUserRecieve {
	constructor(payload: IUserRecieve) {
		Object.assign(this, payload);
	}

	accessToken: string;
	refreshToken: string;

	static get test() {
		return new UserRecieve({ accessToken: tstStr(), refreshToken: tstStr() });
	}
}
