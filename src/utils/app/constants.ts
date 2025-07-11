import { CookieSerializeOptions } from '@fastify/csrf-protection';
import { IMetadata } from 'app/auth/guards';
import { FastifyServerOptions } from 'fastify';
import { DatabaseType } from 'typeorm';
import 'utils';
import { IServerKey } from 'utils/auth/interfaces';

/** Fastify server options for configuration. */
export const fastifyServerOptions: FastifyServerOptions = {
	maxParamLength: 128,
};

/** Regular expression to match server origin URLs. */
export const serverOrigin = /^https?:\/\/(.*)$/;

/** Cookie properties for secure session and CSRF protection. */
export const cookieOptions: CookieSerializeOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	signed: true,
	path: '/',
};

/** Cache duration for database queries. */
export const cacheDurationMs = (5).m2s.s2ms; // Cache duration in milliseconds (5 minute)

/** Server database type. */
export const databaseType: DatabaseType = 'postgres';

/** Server's maximum file uploading size in megabytes. */
export const fileSizeMaximum = 50;

/** Modified fastify interfaces. */
declare module 'fastify' {
	/** Server request. */
	interface FastifyRequest {
		/** Server key. */
		key: IServerKey;
		/** Serving multipart request. */
		isMultipart: boolean;
		/** Client metadata. */
		metadata: IMetadata;
	}
}

declare module '@fastify/secure-session' {
	/** Modified session data. */
	interface SessionData {
		/** Session access key. */
		accessKey: string;
		/** Session identifier. */
		sessionId: string;
	}
}
