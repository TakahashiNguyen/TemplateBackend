import { Bloc } from 'app/auth/bloc/bloc.entity';
import { Hook } from 'app/auth/hook/hook.entity';
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
	/** User key type. */
	user?: User;

	/** Bloc key type. */
	bloc: Bloc;

	/** Hook key type. */
	hook: Hook;
}
