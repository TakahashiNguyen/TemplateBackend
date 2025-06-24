import { Options as Argon2Options } from 'argon2';

export type ModifiedArgon2Options = Required<
	Pick<Argon2Options, 'hashLength' | 'parallelism' | 'timeCost' | 'memoryCost'>
>;

export type TokenType = 'access' | 'refresh';
