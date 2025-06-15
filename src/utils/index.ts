export {};

/**
 * @ignore
 */
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numeric = '0123456789';

/**
 * * Global types
 * @module utils
 * @description Global types for Array, Number, and String interfaces.
 */
declare global {
	/**
	 * Array interface
	 * @template T - Type of elements in the array
	 * */
	interface Array<T> {
		/**
		 * Get random element from array
		 * @example
		 * const arr = ['apple', 'banana', 'cherry'];
		 * const randomFruit = arr.randomElement; // Could be 'apple', 'banana', or 'cherry'
		 * @readonly
		 */
		readonly randomElement: T;

		/**
		 * Get last element of array
		 * @example
		 * const arr = [1, 2, 3];
		 * const lastElement = arr.lastElement; // 3
		 * @readonly
		 */
		readonly lastElement: T;
	}

	/**
	 * Number interface
	 */
	interface Number {
		/**
		 * This property returns the largest integer less than or equal to the given number.
		 * @example
		 * const num = 3.6;
		 * const flooredNum = num.floor; // 3
		 * @readonly
		 */
		readonly floor: number;

		/**
		 * This property returns the value of the given number rounded to the nearest integer.
		 * @example
		 * const num = 3.6;
		 * const roundedNum = num.round; // 4
		 * @readonly
		 */
		readonly round: number;

		/**
		 * This property returns the absolute value of the given number.
		 * @example
		 * const num = -5;
		 * const absoluteNum = num.abs; // 5
		 * @readonly
		 */
		readonly abs: number;

		/**
		 * Generate random alphabetic string with length
		 * @example
		 * const length = 5;
		 * const randomAlpha = length.alpha; // Could be 'abcde', 'XYZab', etc.
		 * @readonly
		 */
		readonly alpha: string;

		/**
		 * Generate random numeric string with length
		 * @example
		 * const length = 5;
		 * const randomNumeric = length.numeric; // Could be '12345', '67890', etc.
		 * @readonly
		 */
		readonly numeric: string;

		/**
		 * Generate random alphanumeric string with length
		 * @example
		 * const length = 5;
		 * const randomString = length.string; // Could be 'a1b2c', 'X9Y8Z', etc.
		 * @readonly
		 */
		readonly string: string;

		/**
		 * This property converts a number representing megabytes to bytes.
		 * It multiplies the number by 1024 twice (1024 * 1024) to convert MB to bytes.
		 * @example
		 * const mb = 5;
		 * const bytes = mb.mb2b; // 5242880
		 * @readonly
		 */
		readonly mb2b: number;

		/**
		 * This property converts seconds to milliseconds.
		 * It multiplies the number by 1000 to convert seconds to milliseconds.
		 * @example
		 * const seconds = 5;
		 * const milliseconds = seconds.s2ms; // 5000
		 * @readonly
		 */
		readonly s2ms: number;

		/**
		 * This property converts minutes to seconds.
		 * It multiplies the number by 60 to convert minutes to seconds.
		 * @example
		 * const minutes = 5;
		 * const seconds = minutes.m2s; // 300
		 * @readonly
		 */
		readonly m2s: number;

		/**
		 * This property converts hours to seconds.
		 * It multiplies the number by 60 twice (60 * 60) to convert hours to seconds.
		 * @example
		 * const hours = 1;
		 * const seconds = hours.h2s; // 3600
		 * @readonly
		 */
		readonly h2s: number;

		/**
		 * Generate a random number between 0 and the given number (exclusive).
		 * @example
		 * const max = 10;
		 * const randomNum = max.random; // Could be 0, 1, 2, ..., 9
		 * @readonly
		 */
		readonly random: number;

		/**
		 * Execute a function multiple times based on the number.
		 * @example
		 * const count = 5;
		 * count.range(() => console.log('Hello')); // Logs 'Hello' 5 times
		 * @param input - A function that returns a Promise or a value to be executed for each iteration.
		 * @returns A Promise that resolves when all iterations are complete.
		 */
		range<T>(input: () => Promise<T> | T): Promise<void>;
	}

	/**
	 * String interface
	 */
	interface String {
		/**
		 * Get a random character from the string
		 * @example
		 * const str = 'hello';
		 * const randomChar = str.randomChar; // Could be 'h', 'e', 'l', 'o'
		 * @readonly
		 */
		readonly randChar: string;

		/**
		 * convert string to lowercase
		 * @example
		 * const str = 'Hello World';
		 * const lowerStr = str.lower; // 'hello world'
		 * @readonly
		 */
		readonly lower: string;

		/**
		 * Capitalize the first letter of the string
		 * @example
		 * const str = 'hello world';
		 * const capitalizedStr = str.capitalize; // 'Hello world'
		 * @readonly
		 */
		readonly capitalize: string;

		/**
		 * Uncapitalize the first letter of the string
		 * @example
		 * const str = 'Hello World';
		 * const uncapitalizedStr = str.uncapitalize; // 'hello World'
		 * @readonly
		 */
		readonly uncapitalize: string;

		/**
		 * Convert to base64url
		 * @example
		 * const str = 'Hello World';
		 * const base64Url = str.toBase64Url; // 'SGVsbG8gV29ybGQ='
		 * @readonly
		 */
		readonly toBase64Url: string;

		/**
		 * Convert from base64url
		 * @example
		 * const base64Url = 'SGVsbG8gV29ybGQ=';
		 * const str = base64Url.fromBase64Url; // 'Hello World'
		 * @readonly
		 */
		readonly fromBase64Url: string;
	}
}

// String.prototype
Object.defineProperty(String.prototype, 'toBase64Url', {
	get: function () {
		return Buffer.from(this as string, 'utf8').toString('base64url');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'fromBase64Url', {
	get: function () {
		return Buffer.from(this as string, 'base64url').toString('utf8');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'randChar', {
	get: function () {
		return (this as string).charAt((this as string).length.random);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'lower', {
	get: function () {
		return (this as string).toLowerCase();
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'capitalize', {
	get: function () {
		return (this || '').at(0).toUpperCase() + (this as string).slice(1);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'uncapitalize', {
	get: function () {
		return (this || '').at(0).toLowerCase() + (this as string).slice(1);
	},
	enumerable: true,
	configurable: true,
});
// Array.prototype
Object.defineProperty(Array.prototype, 'randomElement', {
	get: function () {
		return this[this.length.random];
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Array.prototype, 'lastElement', {
	get: function () {
		return this[this.length - 1];
	},
	enumerable: true,
	configurable: true,
});
// Number.prototype
Number.prototype.range = async function (input: () => void) {
	await Array.from({ length: Number(this) }, (_, i) => i).reduce(async (i) => {
		await i;
		return input();
	}, Promise.resolve());
};
Object.defineProperty(Number.prototype, 'random', {
	get: function () {
		return Math.floor(Math.random() * (this as number));
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'alpha', {
	get: function () {
		if (!this) return '';
		return Array(this)
			.map(() => alphabet.randChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'string', {
	get: function () {
		if (!this) return '';
		return Array(this)
			.map(() => (alphabet + numeric).randChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'numeric', {
	get: function () {
		return Array(this)
			.map(() => numeric.randChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'floor', {
	get: function () {
		return Math.floor(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'round', {
	get: function () {
		return Math.round(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'abs', {
	get: function () {
		return Math.abs(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'mb2b', {
	get: function () {
		return this * 1024 * 1024;
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 's2ms', {
	get: function () {
		return this * 1000;
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'm2s', {
	get: function () {
		return this * 60;
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'h2s', {
	get: function () {
		return this * (60).m2s;
	},
	enumerable: true,
	configurable: true,
});
