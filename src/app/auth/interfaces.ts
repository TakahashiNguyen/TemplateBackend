import { DeepAttributesOnly } from 'utils/app/types';

import { Authentication } from './classes';

/** Authentication interface. */
export interface IAuthentication extends DeepAttributesOnly<Authentication> {
	/** Authenticate type. */
	type: keyof Authentication;
}
