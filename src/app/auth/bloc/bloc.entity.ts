import { User } from 'app/user/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { AttributesOnly, Omitting, Subtract } from 'utils/app/types';
import { Metadata } from 'utils/auth/classes';
import { unidirectionalHash } from 'utils/data/funtions';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';
import { EntityParameters } from 'utils/typeorm/types';

/** Bloc entity. */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'authentication_blocs' })
export class Bloc extends BaseEntity {
	/**
	 * Create bloc with infomations.
	 *
	 * @param {AttributesOnly<
	 * 	Subtract<
	 * 		Omitting<Bloc, 'currentHash' | 'lastIssue' | 'metadata'>,
	 * 		BaseEntity
	 * 	>
	 * > &
	 * 	EntityParameters<typeof BaseEntity> & {
	 * 		currentHash?: string;
	 * 	}} object
	 *   - Input bloc entity fields.
	 */
	constructor(
		object: AttributesOnly<
			Subtract<Omitting<Bloc, 'currentHash' | 'lastIssue'>, BaseEntity>
		> &
			EntityParameters<typeof BaseEntity> & {
				/** Bloc current hash. */ currentHash?: string;
			},
	) {
		super(object);
		this.previousHash = object?.previousHash;
		this.owner = object?.owner;
		// @ts-expect-error error-free expression
		this.currentHash = object?.currentHash;
		// @ts-expect-error error-free expression
		this.metadata = new Metadata(object?.metadata);
	}

	/** Metadata holder. */
	@Column(() => Metadata) metadata: Metadata;

	// Relationships
	/** Bloc owner id. */
	@ManyToOne(() => User, { nullable: true }) owner: User;

	// Infomations
	/** Previous bloc hash. */
	@Column({ nullable: true, update: false }) previousHash?: string;

	/** Current bloc hash. */
	@Column({ nullable: false }) currentHash!: string;

	/** Bloc last issue time. */
	@Column({ nullable: true }) lastIssue!: number;

	// Methods

	/**
	 * Hashing bloc.
	 *
	 * @example
	 *
	 * ```ts
	 * this.hashBloc();
	 * ```
	 */
	@BeforeInsert() @BeforeUpdate() private hashBloc() {
		const { previousHash, metadata, id, owner, lastIssue } = this;

		this.currentHash = unidirectionalHash(
			JSON.stringify({
				metadataHash: metadata.get,
				lastIssue,
				previousHash,
				id,
				owner: owner.id,
			}),
		);
	}

	/**
	 * Testing function to create a Bloc instance with random data.
	 *
	 * @example
	 *
	 * ```test
	 * const testBloc = this.test('foo');
	 * ```
	 *
	 * @param {string} unit - The unit its testing from.
	 * @param {Parameters<typeof User.test>[1]} args - Parameters for test user.
	 * @returns {Bloc} Test bloc.
	 */
	static test(unit: string, args: Parameters<typeof User.test>[1]): Bloc {
		return new Bloc({
			owner: User.test(unit, args),
			previousHash: unit,
			metadata: Metadata.test(),
		});
	}
}
