import { User } from 'app/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GetAttributes, Subtract } from 'utils/app/types';
import { Metadata } from 'utils/auth/classes';
import { ServerException } from 'utils/error';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';

import { IMetadata } from '../guards';

/** Hook entity. */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'auth_hook' })
export class Hook extends BaseEntity {
	/**
	 * Create hook with infomations.
	 *
	 * @param {GetAttributes<Subtract<Hook, BaseEntity>>} object - The hook's
	 *   infomations.
	 */
	constructor(
		object: Pick<
			GetAttributes<Subtract<Hook, BaseEntity>>,
			'owner' | 'signature' | 'note'
		>,
	) {
		super();
		this.owner = object.owner;
		this.signature = object.signature;
		this.note = object.note;
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
