import { type Omitting, UserReceiveDto } from 'templatefullstack-types';

/** Received response. */
export type IResponse = Omitting<UserReceiveDto, 'bloc' | 'hook'>;
