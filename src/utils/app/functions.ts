import { validateOrReject } from 'class-validator';
import { ServerException } from 'utils/error';

/**
 * Validator for class
 * @param {object} input - the object need to validate
 * @return {Promise<T>}
 */
export async function validateObject<T extends object>(input: T): Promise<T> {
	try {
		await validateOrReject(input);

		return input;
	} catch (error) {
		throw new ServerException('Invalid', 'Entity', '', error as Error);
	}
}
