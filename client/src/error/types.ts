import { type Omitting, UserReceiveDto } from 'types';

/** Received response. */
export type IResponse = Omitting<UserReceiveDto, 'bloc' | 'hook'>;
