import { Authentication } from './classes';

/** Authencation interface. */
export interface IAuthentication extends Authentication {
	/** Authenticate type. */
	type: keyof Authentication;
}
