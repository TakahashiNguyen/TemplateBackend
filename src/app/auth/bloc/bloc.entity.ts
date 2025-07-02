import { User } from 'app/user/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { GetAttributes, Omitting, Subtract } from 'utils/app/types';
import { Metadata } from 'utils/auth/classes';
import { unidirectionalHash } from 'utils/data/funtions';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity, TypeOrmBaseEntity } from 'utils/typeorm/classes';

/** Bloc entity. */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'authentication_blocs' })
export class Bloc extends BaseEntity {
	/**
	 * Create bloc with infomations.
	 *
	 * @param {GetAttributes<Subtract<Bloc, TypeOrmBaseEntity>>} object - The
	 *   bloc's infomations.
	 */
	constructor(
		object: GetAttributes<
			Subtract<
				Omitting<Bloc, 'currentHash' | 'lastIssue' | 'metadata'>,
				TypeOrmBaseEntity
			>
		>,
	) {
		super(object);
		if (object == undefined) {
			this.owner = new User(undefined as never);
			this.previousHash = '';
		} else {
			this.owner = object.owner;
			this.previousHash = object.previousHash;
		}
		this.metadata = new Metadata();
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
		return new Bloc({ owner: User.test(unit, args), previousHash: unit });
	}
}
