/**
 * This type for set cookie credentials.
 */
export type CookieCredential = {
	/**
	 * The name of the cookie.
	 */
	name: string;

	/**
	 * The password used to secure the cookie.
	 * It should be a string that is at least 32 characters long.
	 */
	password: string;
};
