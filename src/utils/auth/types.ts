import { Options as Argon2Options } from 'argon2';

/** Modified argon2 options. */
export type ModifiedArgon2Options = Required<
	Pick<Argon2Options, 'hashLength' | 'parallelism' | 'timeCost' | 'memoryCost'>
>;

/** Server's token type. */
export type TokenType = 'access' | 'refresh';
