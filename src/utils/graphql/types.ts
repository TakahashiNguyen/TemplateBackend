import { OutgoingHttpHeaders } from 'http';
import { IFilesForm } from 'utils/app/interfaces';

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
