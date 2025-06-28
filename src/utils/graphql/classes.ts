import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

/** Custom Date and time scalar. */
@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
	/** Scalar description. */
	description = 'DateTime custom scalar type';

	/**
	 * Parse value function.
	 *
	 * @example
	 *
	 * ```ts
	 * this.parseValue('01-01-2000'); // "2000-01-01T00:00:00.000Z"
	 * ```
	 *
	 * @param {unknown} value - Input value for parsing.
	 * @returns {Date} Date instance from `value`.
	 */
	parseValue(value: unknown): Date {
		switch (true) {
			case value instanceof Date:
				return value;

			case typeof value == 'string':
				return new Date(value);

			default:
				return new Date('01-01-2000');
		}
	}

	/**
	 * Serialize from `value`.
	 *
	 * @example
	 *
	 * ```ts
	 * this.serialize('01-01-2000'); // "2000-01-01T00:00:00.000Z"
	 * ```
	 *
	 * @param {unknown} value - Input value for serialization.
	 * @returns {string} Serialized value.
	 */
	serialize(value: unknown): string {
		switch (true) {
			case value instanceof Date:
				return value.toISOString();

			default:
				return this.parseValue(value).toISOString();
		}
	}

	/**
	 * Get value from GraphQL.
	 *
	 * @example
	 *
	 * ```ts
	 * this.parseLiteral('2000-01-01T00:00:00.000Z');
	 * ```
	 *
	 * @param {ValueNode} ast - Input value.
	 * @returns {Date} Converted instance Date from `ast`.
	 */
	parseLiteral(ast: ValueNode): Date {
		if (ast.kind === Kind.STRING) {
			return new Date(ast.value);
		}
		return undefined as unknown as Date;
	}
}
