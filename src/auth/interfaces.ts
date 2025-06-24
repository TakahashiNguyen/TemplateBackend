export interface BaseAuthenticationClass<T> {
	Interface: {
		new (args: T): T;
	};

	create(args: T): T;

	authenticate(...args: unknown[]): boolean;
}

export interface IPasswordAuthentication {
	password: string;
}
