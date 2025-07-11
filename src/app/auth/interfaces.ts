import { Authentication } from './classes';

/** Authentication interface. */
export interface IAuthentication extends Authentication {
	/** Authenticate type. */
	type: keyof Authentication;
}
