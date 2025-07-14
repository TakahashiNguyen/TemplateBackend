import { type Omitting, UserReceiveDto } from 'templatebackend';

/** Received response. */
export type IResponse = Omitting<UserReceiveDto, 'bloc' | 'hook'>;
