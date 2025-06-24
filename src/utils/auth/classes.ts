import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	CipherGCMTypes,
	createCipheriv,
	createDecipheriv,
	randomBytes,
} from 'node:crypto';

import { ITokens } from './interfaces';
import { TokenType } from './types';

/** Security service. */
export class SecurityService {
	/** Encrypt encoding. */
	private encoding: BufferEncoding = 'base64url';

	/** Encrypt algorithm. */
	private algorithm: CipherGCMTypes = 'aes-256-gcm';

	/** Encoding separator. */
	private separator = '$$';

	/** Access secret. */
	private accessSecret: string;

	/** Access expire. */
	private accessExpire: string;

	/** Refresh secret. */
	private refreshSecret: string;

	/** Refresh expire. */
	private refreshExpire: string;

	/** Server secret. */
	private serverSecret: string;

	/** JSON web token service. */
	private jwt: JwtService;

	/** Initializes SecurityService with JwtService and ConfigService. */
	constructor(jwt: JwtService, config: ConfigService) {
		this.jwt = jwt;
		this.accessSecret = config.getOrThrow('ACCESS_SECRET');
		this.accessExpire = config.getOrThrow('ACCESS_EXPIRE');
		this.refreshSecret = config.getOrThrow('REFRESH_SECRET');
		this.refreshExpire = config.getOrThrow('REFRESH_EXPIRE');
		this.serverSecret = config.getOrThrow('SERVER_SECRET');
	}

	/**
	 * Refresh token signer.
	 *
	 * @example
	 *
	 * ```ts
	 * const jwtRefresh = this.refresh(str);
	 * ```
	 *
	 * @param {string} input - Input string to sign.
	 * @returns {string} Signed string from `input`.
	 * @access public
	 */
	public refresh(input: string): string {
		return this.jwt.sign(
			{ refreshToken: input },
			{ secret: this.refreshSecret, expiresIn: this.refreshExpire },
		);
	}

	/**
	 * Access token signer.
	 *
	 * @example
	 *
	 * ```ts
	 * cosnt jwtAccess = this.access(str);
	 * ```
	 *
	 * @param {string} input - Input string to sign.
	 * @returns {string} Signed string from `input`.
	 * @access public
	 */
	access(input: string): string {
		return this.jwt.sign(
			{ accessToken: input },
			{ secret: this.accessSecret, expiresIn: this.accessExpire },
		);
	}

	/**
	 * The function to verifying `input` and return tokens.
	 *
	 * @example
	 *
	 * ```ts
	 * const tokens = this.verify(str, 'access');
	 * ```
	 *
	 * @param {string} input - Input signed string.
	 * @param {TokenType} [type] - `input` signed type.
	 * @returns {ITokens} Contents server tokens.
	 */
	verify(input: string, type: TokenType = 'access'): ITokens {
		return this.jwt.verify(input, {
			secret: type === 'access' ? this.accessSecret : this.refreshSecret,
		});
	}

	/**
	 * Convert signature to key.
	 *
	 * @example
	 *
	 * ```ts
	 * const key = signatureToKey(signature, 32);
	 * ```
	 *
	 * @param {string} input - The signature to be converted.
	 * @param {number} length - Key length.
	 * @returns {string} Converted string from `input`.
	 */
	private signatureToKey(input: string, length: number): string {
		return input.substring(0, length).padStart(length, '0');
	}

	/**
	 * The function to encrypt a string.
	 *
	 * @example
	 *
	 * ```ts
	 * const encryptedString = this.encrypt(str, 'foo');
	 * ```
	 *
	 * @param {string} input - The string is going to be encrypted.
	 * @param {string} key - The key to encrypt `input` (default:
	 *   this.serverSecret).
	 * @returns {string} The encrypted `input`.
	 */
	encrypt(input: string, key: string = this.serverSecret): string {
		const { encoding, algorithm, separator } = this,
			iv = randomBytes(16),
			cipher = createCipheriv(
				algorithm,
				this.signatureToKey(key, ~~algorithm.split('-')[1] / 8),
				iv,
			),
			encrypted = Buffer.concat([cipher.update(input), cipher.final()]),
			authTag = cipher.getAuthTag();
		return (
			iv.toString(encoding) +
			separator +
			encrypted.toString(encoding) +
			separator +
			authTag.toString(encoding)
		);
	}

	/**
	 * The function to decrypt a string.
	 *
	 * @example
	 *
	 * ```ts
	 * const decryptedString = this.decrypt(str, 'foo');
	 * ```
	 *
	 * @param {string} input - The encrypted string.
	 * @param {string} [key] - The key to decrypt `input` (default:
	 *   this.serverSecret).
	 * @returns {string} The decrypted `input`.
	 */
	decrypt(input: string, key: string = this.serverSecret): string {
		if (!input || !key) return '';
		const { encoding, algorithm, separator } = this,
			[iv, encrypted, authTag] = input.split(separator),
			decipher = createDecipheriv(
				algorithm,
				this.signatureToKey(key, ~~algorithm.split('-')[1] / 8),
				Buffer.from(iv, encoding),
			);

		decipher.setAuthTag(Buffer.from(authTag, encoding));
		try {
			return Buffer.concat([
				decipher.update(Buffer.from(encrypted, encoding)),
				decipher.final(),
			]).toString();
		} catch {
			return '';
		}
	}
}
