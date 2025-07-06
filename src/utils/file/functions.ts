/**
 * Convert a stream to buffer.
 *
 * @example
 *
 * ```ts
 * stream2buffer(stream);
 * ```
 *
 * @param {NodeJS.ReadableStream} stream - Input stream.
 * @returns {Promise<Buffer>} A buffer.
 */
export async function stream2buffer(
	stream: NodeJS.ReadableStream,
): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const _buf = Array<never>();

		stream.on('data', (chunk) => _buf.push(chunk as never));
		stream.on('end', () => resolve(Buffer.concat(_buf)));
		stream.on('error', (err) => reject(`error converting stream - ${err}`));
	});
}
