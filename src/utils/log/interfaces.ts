import { Colors } from 'picocolors/types';

import { KeepBgKeys, RemoveBgKeys } from '.';

/**
 * Options for color logging.
 */
interface ColorLogOptions {
	/**
	 * The message to log.
	 */
	msg: string;

	/**
	 * Background color for the message.
	 */
	bg?: keyof Omit<KeepBgKeys<Colors>, 'isColorSupported'> | '';

	/**
	 * Font color for the message.
	 */
	font?: keyof Omit<RemoveBgKeys<Colors>, 'isColorSupported'> | '';
}

export { ColorLogOptions };
