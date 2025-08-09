import { User } from 'app/user/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import {
	ApplyPartial,
	AttributesOnly,
	ClassType,
	Omitting,
	Subtract,
} from 'utils/app/types';
import { Metadata } from 'utils/auth/classes';
import { unidirectionalHash } from 'utils/data/functions';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';
import { EntityParameters } from 'utils/typeorm/types';

/** Bloc entity. */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'authentication_blocs' })
export class Bloc extends BaseEntity {
	/**
	 * Create bloc with information.
	 *
	 * @param {AttributesOnly<
	 * 	Subtract<
	 * 		ApplyPartial<
	 * 			Omitting<Bloc, 'metadata' | 'owner'>,
	 * 			'lastIssue' | 'currentHash'
	 * 		>,
	 * 		BaseEntity
	 * 	>
	 * > & {
	 * 	metadata: ClassType<Metadata>;
	 * 	owner: ClassType<User>;
	 * } & EntityParameters<typeof BaseEntity>} object
	 *   - Input bloc entity fields.
	 */
	constructor(
		object: AttributesOnly<
			Subtract<
				ApplyPartial<
					Omitting<Bloc, 'metadata' | 'owner'>,
					'lastIssue' | 'currentHash'
				>,
				BaseEntity
			>
		> & {
			/** Metadata class input. */ metadata: ClassType<typeof Metadata>;
			/** User class input. */ owner: ClassType<typeof User>;
		} & EntityParameters<typeof BaseEntity>,
	) {
		super(object);
		this.previousHash = object?.previousHash;

		// @ts-expect-error nullable field
		this.currentHash = object?.currentHash;
		// @ts-expect-error nullable field
		this.lastIssue = object?.lastIssue;

		// classes
		// @ts-expect-error entity input
		this.metadata = new Metadata(object?.metadata);
		this.owner = new User(object?.owner);
	}

	/** Metadata holder. */
	@Column(() => Metadata) metadata: Metadata;

	// Relationships
	/** Bloc owner id. */
	@ManyToOne(() => User, { nullable: true }) owner: User;

	// Information
	/** Previous bloc hash. */
	@Column({ nullable: true, update: false }) previousHash?: string;

	/** Current bloc hash. */
	@Column({ nullable: false }) currentHash: string;

	/** Bloc last issue time. */
	@Column({ nullable: true }) lastIssue: number;

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
	 * @param {ConstructorParameters<typeof User>[0]} args - Parameters for test
	 *   user.
	 * @returns {Bloc} Test bloc.
	 */
	static test(unit: string, args: ConstructorParameters<typeof User>[0]): Bloc {
		return new Bloc({
			owner: User.test(unit, args),
			previousHash: unit,
			metadata: Metadata.test(),
		});
	}
}
