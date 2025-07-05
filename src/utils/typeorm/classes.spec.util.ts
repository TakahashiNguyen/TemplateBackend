import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, Repository } from 'typeorm';
import { AttributesOnly, Subtract } from 'utils/app/types';

import { BaseEntity, DatabaseRequests } from './classes';
import { EntityParameters } from './types';

/** Test entity. */
@Entity()
export class TestEntity extends BaseEntity {
	/**
	 * Create an instance of TestEntity.
	 *
	 * @param {AttributesOnly<Subtract<TestEntity, BaseEntity>> &
	 * 	EntityParameters<typeof BaseEntity>} object
	 *   - Input test entity fields.
	 */
	constructor(
		object: AttributesOnly<Subtract<TestEntity, BaseEntity>> &
			EntityParameters<typeof BaseEntity>,
	) {
		super(object);
		this.str = object?.str;
		this.num = object?.num;
	}

	/** Testing string attribute. */
	@Column() str: string;

	/** Testing number attribute. */
	@Column() num: number;
}

/** Test entity service class. */
@Injectable()
export class TestEntityService extends DatabaseRequests<typeof TestEntity> {
	/**
	 * Initiate test entity service.
	 *
	 * @param {Repository<TestEntity>} repo - Entity repo.
	 */
	constructor(@InjectRepository(TestEntity) repo: Repository<TestEntity>) {
		super(repo, TestEntity);
	}

	/**
	 * Create a test entity.
	 *
	 * @example
	 *
	 * ```ts
	 * this.create(testEntity);
	 * ```
	 *
	 * @param {Parameters<typeof this.$create>} args - Input arguments.
	 * @returns {Promise<User>} Instance of TestEntity.
	 */
	public create(...args: Parameters<typeof this.$create>): Promise<TestEntity> {
		return this.$create(...args);
	}

	/**
	 * Update a test entity.
	 *
	 * @example
	 *
	 * ```ts
	 * this.update({ id }, updatedEntity);
	 * ```
	 *
	 * @param {Parameters<typeof this.$update>} args - Input arguments.
	 * @returns {Promise<void>}
	 */
	public update(...args: Parameters<typeof this.$update>): Promise<void> {
		return this.$update(...args);
	}
}
