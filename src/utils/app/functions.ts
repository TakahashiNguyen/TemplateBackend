import { DynamicModule } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ServerException } from 'utils/error';

/**
 * The function validate object has `validate-class` decorators.
 *
 * @example
 *
 * ```ts
 * import { IsString } from 'class-validator';
 * class Foo { IsString() name: string; }
 * const foo = new Foo();
 * foo.name = 'Bar';
 * validateObject(foo); // foo.
 * ```
 *
 * @template T - Type that extended `object`.
 * @param {T} input - The value extends `object` and has `class-validator`
 *   decorators.
 * @returns {Promise<T>} `input` if `input` meets all `class-validatior`
 *   decorators requirements.
 * @throws {ServerException} Throw an error when `input` doesn't meet all
 *   `class-validator` decorators.
 */
export async function validateObject<T extends object>(input: T): Promise<T> {
	try {
		await validateOrReject(input);

		return input;
	} catch (error) {
		throw new ServerException('Invalid', 'Entity', '', error as Error);
	}
}

/**
 * Sort object by keys.
 *
 * @example
 *
 * ```ts
 * const foo = { b: 'bar', a: 'alpha' };
 * sortObjectKeys(foo); // {a: 'alpha', b: 'bar'}
 * ```
 *
 * @param {object} input - Object needs to sort by keys.
 * @returns {object} Sorted `input`.
 */
export function sortObjectKeys(input: object): object {
	return Object.keys(input)
		.sort()
		.reduce((obj: object, key: string) => {
			if (typeof input[key as keyof typeof input] == 'object')
				Object.assign(obj, {
					[key]: sortObjectKeys(input[key as keyof typeof input]),
				});
			else Object.assign(obj, { [key]: input[key as keyof typeof input] });

			return obj;
		}, {});
}

/**
 * Get current system time.
 *
 * @example
 *
 * ```ts
 * const time = currentTime();
 * ```
 *
 * @returns {number} Current system time.
 */
export function currentTime(): number {
	return Math.floor(new Date().getTime() / 1000);
}

/**
 * Get default export from each subdirectory from `directory`.
 *
 * @example
 *
 * ```ts
 * getDefaultExportFromSubdirectory(__dirname);
 * ```
 *
 * @param {string} directory - Current directory.
 * @returns {DynamicModule[]} Array of nestjs modules.
 */
export function getDefaultExportFromSubdirectory(
	directory: string,
): DynamicModule[] {
	return readdirSync(directory, { withFileTypes: true })
		.filter((i) => i.isDirectory())
		.map((i) => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				return require(join(i.parentPath, i.name)).default;
			} catch (error) {
				switch (true) {
					// @ts-expect-error error-free expression
					case error.code == 'MODULE_NOT_FOUND':
						break;

					default:
						console.warn((error as Error).message);
						break;
				}
			}
		})
		.filter((i) => i != undefined);
}
