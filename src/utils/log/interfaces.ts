import { Colors } from 'picocolors/types';
import { Omitting } from 'utils/app/types';

import { KeepBgKeys, RemoveBgKeys } from '.';

/** Options for color logging. */
interface ColorLogOptions {
	/** The message to log. */
	msg: string;

	/** Background color for the message. */
	bg?: keyof KeepBgKeys<Colors> | '';

	/** Font color for the message. */
	font?: keyof Omitting<RemoveBgKeys<Colors>, 'isColorSupported'> | '';
}

export { ColorLogOptions };
