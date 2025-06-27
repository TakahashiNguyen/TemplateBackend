/** This type for set cookie credentials. */
export type CookieCredential = {
	/** The name of the cookie. */
	name: string;

	/**
	 * The password used to secure the cookie. It should be a string that is at
	 * least 32 characters long.
	 */
	password: string;
};

/**
 * This type handle ambiguous return type.
 *
 * @template T
 */
export type AmbiguousReturn<T> = Promise<T> | T;

/**
 * Remove properties and methods in `A` that already has in `B`.
 *
 * @template A
 * @template B
 */
export type Subtract<A, B> = {
	[K in keyof A as K extends keyof B
		? A[K] extends B[K]
			? B[K] extends A[K]
				? never
				: never
			: K
		: K]: A[K];
};

/**
 * Get attributes from `T`.
 *
 * @template T
 */
export type GetAttributes<T> = {
	[K in keyof T as T[K] extends <P>(...args: never[]) => P | Promise<P>
		? never
		: K]: T[K];
};

/**
 * Only required one of specified keys and remove remains.
 *
 * @template T
 * @template Keys
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = {
	[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

/**
 * Better omit type.
 *
 * @template T
 * @template K
 */
export type Omitting<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
