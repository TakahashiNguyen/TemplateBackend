import { OutgoingHttpHeaders } from 'http';
import { IFilesForm } from 'utils/app/interfaces';

import { Expectation } from './interfaces';

/**
 * Execute options.
 *
 * @template K
 * @template R
 * @template F
 */
export type ExecuteOptions<K extends keyof jest.Matchers<Promise<R>>, R, F> = {
	/**
	 * Number of loop execution before testing.
	 *
	 * @default 1
	 */
	numberOfLoopExecution?: number;

	/** Testing function expectations. */
	expectations: Expectation<F, K>[];

	/** Testing function on finish handler. */
	onFinish?: (result: R) => void | Promise<void>;

	/** Handler function for loop execution before testing. */
	handleLoopExecution?: (func: F) => void | Promise<void>;
};

/**
 * Function `sendGraphQL` return type.
 *
 * @template T
 * @template K
 */
export type SendGraphQLType<T, K> = (
	variables: K,
	{
		headers,
		map,
		files,
	}: {
		/** Input files. */
		files?: IFilesForm;
		/** Input headers. */
		headers: OutgoingHttpHeaders;
		/** Input map. */
		map?: object;
	},
) => Promise<T>;
