import { User } from 'app/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import {
	ApplyPartial,
	AttributesOnly,
	Omitting,
	Subtract,
} from 'utils/app/types';
import { Metadata } from 'utils/auth/classes';
import { ServerException } from 'utils/error/classes';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';
import { EntityParameters } from 'utils/typeorm/types';

import { IMetadata } from '../guards';

/** Hook entity. */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'authentication_hooks' })
export class Hook extends BaseEntity {
	/**
	 * Create hook with information.
	 *
	 * @param {AttributesOnly<
	 * 	Subtract<ApplyPartial<Omitting<Hook, 'metadata'>, 'note'>, BaseEntity>
	 * > & {
	 * 	metadata: ConstructorParameters<typeof Metadata>[0];
	 * } & EntityParameters<typeof BaseEntity>} object
	 *   - Input hook entity fields.
	 */
	constructor(
		object: AttributesOnly<
			Subtract<ApplyPartial<Omitting<Hook, 'metadata'>, 'note'>, BaseEntity>
		> & {
			/** Metadata class input. */ metadata: ConstructorParameters<
				typeof Metadata
			>[0];
		} & EntityParameters<typeof BaseEntity>,
	) {
		super(object);
		this.owner = object?.owner;
		this.signature = object?.signature;

		// @ts-expect-error nullable field
		this.note = object?.note;

		// class
		this.metadata = new Metadata(object?.metadata);
	}

	// Relationships
	/** Hook from user. */
	@ManyToOne(() => User, { nullable: true })
	owner: User;

	// Information
	/** Hook's signature. */
	@Column({ nullable: false }) signature: string;

	/** Client's metadata. */
	@Column(() => Metadata) metadata: Metadata;

	/** Addition information. */
	@Column({ type: 'jsonb', default: {} }) note: object;

	/**
	 * Verifying hook.
	 *
	 * @example
	 *
	 * ```ts
	 * this.verify(mtdt, signature);
	 * ```
	 *
	 * @param {IMetadata} metadata - Input metadata.
	 * @param {string} signature - Input signature.
	 * @throws {ServerException} Will throw an error if `metadata` or `signature`
	 *   not match with current hook.
	 */
	verify(metadata: IMetadata, signature: string) {
		if (!this.metadata.verify(metadata) || this.signature !== signature)
			throw new ServerException('Invalid', 'Hook', 'Request');
	}
}
