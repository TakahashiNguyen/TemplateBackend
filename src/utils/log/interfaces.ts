import { Colors } from 'picocolors/types';

import { KeepBgKeys, RemoveBgKeys } from '.';

/**
 * Options for color logging.
 * @property {string} msg - The message to log.
 * @property {keyof Omit<KeepBgKeys<Colors>, 'isColorSupported'> | ''} bg - The background color to use.
 * @property {keyof Omit<RemoveBgKeys<Colors>, 'isColorSupported'> | ''} font - The font color to use.
 */
interface ColorLogOptions {
	msg: string;
	bg?: keyof Omit<KeepBgKeys<Colors>, 'isColorSupported'> | '';
	font?: keyof Omit<RemoveBgKeys<Colors>, 'isColorSupported'> | '';
}

export { ColorLogOptions };
