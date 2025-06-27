import { User } from 'app/user/user.entity';

/** Server tokens. */
export interface ITokens {
	/** Access token. */
	accessToken?: string;

	/** Refresh token. */
	refreshToken?: string;
}

/** Server key. */
export interface IServerKey {
	/** User type key. */
	user: User;
}
