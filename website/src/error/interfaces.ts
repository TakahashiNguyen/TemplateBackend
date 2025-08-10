import { type ErrorObject, type ErrorType } from 'templatefullstack-types';

/** Alert interface. */
export interface IAlert {
	/** Alert message. */
	message: string;
	/** Alert type. */
	type: ErrorType | 'Processing' | 'None';
	/** Alert object. */
	object: ErrorObject | 'None';
}
