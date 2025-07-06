import { Readable } from 'stream';

/** AWS recieve object. */
export interface AWSRecieve {
	/** File stream. */
	stream: Readable;
	/** File length. */
	length: number;
	/** File type. */
	type: string;
}
