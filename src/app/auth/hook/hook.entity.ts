import { User } from 'app/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AttributesOnly, Subtract } from 'utils/app/types';
import { Metadata } from 'utils/auth/classes';
import { ServerException } from 'utils/error';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';
import { EntityParameters } from 'utils/typeorm/types';

import { IMetadata } from '../guards';

/** Hook entity. */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'authentication_hooks' })
export class Hook extends BaseEntity {
	/**
	 * Create hook with infomations.
	 *
	 * @param {AttributesOnly<Subtract<Hook, BaseEntity>> &
	 * 	EntityParameters<typeof BaseEntity>} object
	 *   - Input hook entity fields.
	 */
	constructor(
		object: AttributesOnly<
			Subtract<Pick<Hook, 'owner' | 'signature' | 'note'>, BaseEntity>
		> &
			EntityParameters<typeof BaseEntity>,
	) {
		super(object);
		this.owner = object?.owner;
		this.signature = object?.signature;
		this.note = object?.note;
		this.metadata = new Metadata();
	}

	// Relationships
	/** Hook from user. */
	@ManyToOne(() => User, { nullable: true })
	owner: User;

	// Infomations
	/** Hook's signature. */
	@Column({ nullable: false }) signature: string;

	/** Client's metadata. */
	@Column(() => Metadata) metadata: Metadata;

	/** Addition infomations. */
	@Column({ type: 'jsonb', default: {} }) note?: object;

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
			throw new ServerException('Invalid', 'Hook', '');
	}
}
