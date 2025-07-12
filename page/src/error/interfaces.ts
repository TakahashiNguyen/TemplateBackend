import type { IObject } from './types';

/** Alert interface. */
export interface IAlert {
	/** Alert message. */
	message: string;
	/** Alert type. */
	type: 'success' | 'error' | 'processing' | 'none';
	/** Alert object. */
	object?: IObject;
}
