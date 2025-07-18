import axios from 'axios';

import { API_URL } from './constants';

/**
 * A api requester.
 *
 * @example
 *
 * ```ts
 * requester(url, body);
 * ```
 *
 * @param {string} url - Target url.
 * @param {object} input - Request form.
 */
export async function requester(url: string, input: object) {
	const { token } = (
			await axios.get(API_URL + '/csrf-token', { withCredentials: true })
		).data,
		{ data } = await axios.post(API_URL + url, input, {
			headers: { 'csrf-token': token },
			withCredentials: true,
		});

	return data;
}
