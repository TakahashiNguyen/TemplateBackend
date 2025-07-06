import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'app/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AttributesOnly, ClassType, Omitting, Subtract } from 'utils/app/types';
import { CacheControl } from 'utils/graphql/functions';
import { BaseEntity } from 'utils/typeorm/classes';
import { EntityParameters } from 'utils/typeorm/types';

/** File entity. */
@ObjectType()
@CacheControl({ maxAge: (2).m2s })
@Entity()
export class File extends BaseEntity {
	/**
	 * Create file with infomations.
	 *
	 * @param {AttributesOnly<
	 * 	Subtract<Omitting<File, 'owner'>, BaseEntity>
	 * > & {
	 * 	owner: ClassType<typeof User>;
	 * } & EntityParameters<typeof BaseEntity>} object
	 *   - Input file entity fields.
	 */
	constructor(
		object: AttributesOnly<Subtract<Omitting<File, 'owner'>, BaseEntity>> & {
			/** User class. */ owner: ClassType<typeof User>;
		} & EntityParameters<typeof BaseEntity>,
	) {
		super(object);

		this.path = object?.path;
		this.title = object?.title;

		// classes
		this.owner = new User(object?.owner);
	}

	// Relationships
	/** File creator. */
	@ManyToOne(() => User, ($) => $.files, { nullable: true })
	owner: User;

	// Infomations
	/** File's path. */
	@Field() @Column() path: string;

	/** File's title. */
	@Field() @Column() title: string;
}
