import type { AxiosError } from 'axios';
import { serverException } from 'templatefullstack-types';
import { reactive } from 'vue';

import type { IAlert } from './interfaces';
import type { IResponse } from './types';

/**
 * Get alert function.
 *
 * @example
 *
 * ```ts
 * getAlert();
 * ```
 */
export function getAlert() {
	return reactive<IAlert>({ message: '', type: 'None', object: 'None' });
}

/**
 * API error handler.
 *
 * @example
 *
 * ```ts
 * apiErrorHandler(response, alert);
 * ```
 *
 * @param {Promise<IResponse>} response - Api response.
 * @param {ReturnType<typeof getAlert>} alert - Alert variable.
 */
export async function apiErrorHandler(
	response: Promise<IResponse>,
	alert: ReturnType<typeof getAlert>,
) {
	alert.message = '';
	alert.type = 'Processing';

	try {
		switch ((await response).message) {
			case serverException('Success', 'Signature', 'Sent'):
				alert.message =
					'An email has sent to your email address, please check inbox and spam';
				alert.type = 'Success';
				alert.object = 'Email';
				break;
			default:
				break;
		}
	} catch (e) {
		const { response } = e as AxiosError<IResponse, unknown>;

		if (response == undefined) throw new Error('Undefined response');

		const { message } = response.data;

		switch (true) {
			case message.includes(
				serverException('Invalid', 'Authentication', 'Submit'),
			):
				alert.message = 'Invalid submission, please re-enter';
				alert.type = 'Invalid';
				alert.object = 'Authentication';
				break;

			case message.includes(serverException('Invalid', 'Email', 'Submit')):
				alert.message = 'Email not found, please re-enter your email';
				alert.type = 'Invalid';
				alert.object = 'Email';
				break;

			case message.includes(serverException('Invalid', 'User', 'Assign')):
				alert.message = 'This email address has been assigned to an account';
				alert.type = 'Invalid';
				alert.object = 'User';
				break;

			default:
				alert.message = 'Something went wrong';
				alert.type = 'Fatal';
				alert.object = 'Client';
				break;
		}
	}
}
