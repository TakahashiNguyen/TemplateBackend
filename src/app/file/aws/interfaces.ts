import { Readable } from 'stream';

/** AWS receive object. */
export interface AWSReceive {
	/** File stream. */
	stream: Readable;
	/** File length. */
	length: number;
	/** File type. */
	type: string;
}
