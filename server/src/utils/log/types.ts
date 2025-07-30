/**
 * Utility types to keep properties with a "bg" prefix.
 *
 * @template T
 */
type KeepBgKeys<T> = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	[K in keyof T as K extends `bg${infer _}` ? K : never]: T[K];
};

/**
 * Utility types to remove properties with a "bg" prefix.
 *
 * @template T
 */
type RemoveBgKeys<T> = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	[K in keyof T as K extends `bg${infer _}` ? never : K]: T[K];
};

export { KeepBgKeys, RemoveBgKeys };
