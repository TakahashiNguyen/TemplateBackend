import { validateOrReject } from 'class-validator';
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
 * @returns `input` if `input` meets all `class-validatior` decorators
 *   requirements.
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
