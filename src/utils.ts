import { randomBytes } from 'crypto';

export type InitClass<T> = {
	[K in keyof T as T[K] extends string | number | any[] ? K : never]: T[K];
};

export class Str {
	static random(length: number = 12) {
		return randomBytes(length / 2).toString('hex');
	}
}

export class Base<T> {
	constructor(payload: InitClass<T>) {
		for (const key in payload as any) this[key] = payload[key];
	}
}
