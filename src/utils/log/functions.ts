import pc from 'picocolors';

import { ColorLogOptions } from '.';

/**
 * Logs a message with specified background and font colors.
 *
 * @param {ColorLogOptions} args - The options for color logging.
 * @returns {string} The formatted message with colors applied.
 */
function colorLogging(args: ColorLogOptions): string {
	return (args.bg ? pc[args.bg] : String)(
		(args.font ? pc[args.font] : String)(args.msg),
	);
}

export { colorLogging };
