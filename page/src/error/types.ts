import { type Omitting, UserReceiveDto } from 'templatebackend-types';

/** Received response. */
export type IResponse = Omitting<UserReceiveDto, 'bloc' | 'hook'>;
