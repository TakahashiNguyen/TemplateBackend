import { IsOptional } from 'class-validator';
import {
	CreateDateColumn,
	DeepPartial,
	FindOneOptions,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	BaseEntity as TypeOrmBaseEntity,
	UpdateDateColumn,
} from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { validateObject } from 'utils/app/functions';
import { AttributesOnly, Subtract } from 'utils/app/types';
import { ServerException } from 'utils/error';

import { ExtendedFindOneOptions, ExtendedFindOptions } from './types';

export { TypeOrmBaseEntity };

/** Base entity class that provides common fields for all entities. */
export abstract class BaseEntity extends TypeOrmBaseEntity {
	/** Unique identifier for the entity. */
	@PrimaryGeneratedColumn('uuid')
	@IsOptional()
	id: string;

	/** Creation date record. */
	@CreateDateColumn()
	@IsOptional()
	createdAt: Date;

	/** Last update date record. */
	@UpdateDateColumn()
	@IsOptional()
	updatedAt: Date;

	/**
	 * Create an instance of BaseEntity.
	 *
	 * @param {Partial<
	 * 	AttributesOnly<Subtract<BaseEntity, TypeOrmBaseEntity>>
	 * >} object
	 *   - Input base entity fields.
	 */
	constructor(
		object: Partial<AttributesOnly<Subtract<BaseEntity, TypeOrmBaseEntity>>>,
	) {
		super();
		// @ts-expect-error nullable field
		this.id = object?.id;
		// @ts-expect-error nullable field
		this.createdAt = object?.createdAt;
		// @ts-expect-error nullable field
		this.updatedAt = object?.updatedAt;
	}
}

/**
 * Base class for database requests.
 *
 * @template T - Type of the entity.
 * @template C - Entity constructor.
 * @template P - Constructor's parameters.
 */
export abstract class DatabaseRequests<
	C extends new (args: P) => T,
	T extends BaseEntity = InstanceType<C>,
	P extends object = ConstructorParameters<C>[0],
> {
	/** Entity relationships. */
	private relations: string[];

	/** Entity's repository. */
	private repo: Repository<T>;

	/** Entity's constructor. */
	private ctor: C;

	/**
	 * Initiate database methods for entity.
	 *
	 * @param {typeof this.repo} repo - Entity's repository.
	 * @param {typeof this.ctor} ctor - Entity's constructor.
	 */
	constructor(repo: typeof this.repo, ctor: typeof this.ctor) {
		this.relations = repo.metadata.relations
			.map((i) => this.exploreEntityMetadata(i))
			.flat();
		this.repo = repo;
		this.ctor = ctor;
	}

	/**
	 * Exploring entity relationships.
	 *
	 * @example This.exploreEntityMetadata(repo.metadata.relations[0]);
	 *
	 * @param {RelationMetadata} input - The entity with relationships.
	 * @param {string} parentName - Discovered relationships.
	 * @param {string} avoidNames - Relationships must be avoid.
	 * @returns {string[]} Array of relationships.
	 */
	private exploreEntityMetadata(
		input: RelationMetadata,
		parentName: string = '',
		avoidNames: string = '',
	): Array<string> {
		if (
			[input.propertyName].every(
				(i) =>
					parentName.split('.').includes(i) ||
					avoidNames.split('.').includes(i),
			) ||
			input.propertyName !== input.propertyPath
		)
			return [];
		const currentRelationName = parentName + input.propertyName;
		return [`${currentRelationName}`].concat(
			...input.inverseEntityMetadata.relations.map((i) =>
				this.exploreEntityMetadata(
					i,
					`${currentRelationName}.`,
					`${avoidNames}.${i.inverseSidePropertyPath}`,
				),
			),
		);
	}

	// Read

	/**
	 * Get entity from id.
	 *
	 * @example
	 *
	 * ```ts
	 * const entity = await this.id(entityId);
	 * ```
	 *
	 * @param {string | undefined} id - The entity's id.
	 * @returns {Promise<T | undefined>} Found entity.
	 * @throws {ServerException} If the id is null or undefined.
	 */
	public readonly id = (id: string | undefined): Promise<T | undefined> => {
		if (id == undefined) throw new ServerException('Invalid', 'ID', 'Submit');

		// @ts-expect-error error-free expression
		return this.findOne({ id, cache: false });
	};

	/**
	 * Finding objects.
	 *
	 * @example
	 *
	 * ```ts
	 * const entities = await this.find(entityWithSpecificFields);
	 * ```
	 *
	 * @param {FindWhereExtend<T, ExtendedFindOptions>} options - Function's
	 *   option.
	 * @returns {Promise<T[]>} Array of found objects.
	 */
	public readonly find = async (
		options?: DeepPartial<P> & ExtendedFindOptions,
	): Promise<T[]> => {
		const {
				deep = 1,
				relations: requestRelation = [''],
				take = 10e10,
				skip = 0,
				order = undefined,
				cache = true,
				writeLock = false,
				...entity
			} = options || {},
			{ ctor, relations: coreRelations } = this,
			relations = coreRelations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => requestRelation.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index),
			where = new ctor(entity as P) as FindOptionsWhere<T>,
			lock: FindOneOptions['lock'] = writeLock
				? { mode: 'pessimistic_write' }
				: undefined;

		return (
			(
				await this.repo.find({
					where,
					take,
					skip,
					order,
					relations,
					cache,
					lock,
				})
			)
				// @ts-expect-error entity input
				.map((i) => new ctor(i))
		);
	};

	/**
	 * Finding an entity.
	 *
	 * @example
	 *
	 * ```ts
	 * const entity = await this.findOne(entityWithSpecificFields);
	 * ```
	 *
	 * @param {FindWhereExtend<T, ExtendedFindOneOptions>} options - Function's
	 *   option.
	 * @returns {Promise<T | undefined>} An entity match `option` request.
	 */
	public readonly findOne = async (
		options: DeepPartial<P> & ExtendedFindOneOptions,
	): Promise<T | undefined> => {
		const {
				deep = 1,
				relations: requestRelation = [''],
				order = undefined,
				cache = true,
				writeLock = false,
				...entity
			} = options || {},
			{ ctor, relations: coreRelations } = this,
			relations = coreRelations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => requestRelation.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index),
			where = new ctor(entity as P) as FindOptionsWhere<T>,
			lock: FindOneOptions['lock'] = writeLock
				? { mode: 'pessimistic_write' }
				: undefined,
			found = await this.repo.findOne({ where, order, relations, cache, lock });

		// @ts-expect-error entity input
		return found != null ? new ctor(found) : undefined;
	};

	// Create

	/**
	 * Saving an entity.
	 *
	 * @example
	 *
	 * ```ts
	 * entity = this.create(entity, { raw: true, validate: false });
	 * ```
	 *
	 * @param {DeepPartial<T>} entity - The saving entity.
	 * @returns {Promise<T>} An entity that created in database.
	 */
	protected readonly $create = async (entity: P): Promise<T> => {
		return new this.ctor(
			// @ts-expect-error entity input
			await this.repo.save(await validateObject(new this.ctor(entity))),
		);
	};

	public abstract create(...args: unknown[]): Promise<T>;

	// Update

	/**
	 * Updating entity.
	 *
	 * @example
	 *
	 * ```ts
	 * this.update({ id: entityId }, updatedEntity);
	 * ```
	 *
	 * @param {FindOptionsWhere<T>} targetEntity - Target entity.
	 * @param {DeepPartial<T>} updatedEntity - Updated entity.
	 */
	protected readonly $update = async (
		targetEntity: DeepPartial<P>,
		updatedEntity: DeepPartial<P>,
	): Promise<void> => {
		// @ts-expect-error error-free expression
		const entities = await this.find(targetEntity);

		if (
			updatedEntity != null &&
			Object.keys(updatedEntity).length &&
			targetEntity != null &&
			Object.keys(targetEntity).length &&
			entities.length
		)
			await Promise.all(
				// @ts-expect-error entity input
				entities.map((i) => this.$create({ ...i, ...updatedEntity })),
			);
	};

	public abstract update(...args: unknown[]): Promise<void>;

	// Delete

	/**
	 * Removing an entity by identifier string.
	 *
	 * @example
	 *
	 * ```ts
	 * this.delete(entityId);
	 * ```
	 *
	 * @param {string | undefined} id - The entity identifier string.
	 * @returns {Promise<void>} Resolves when the entity is deleted.
	 * @throws {ServerException} If the id is null or undefined.
	 */
	public readonly delete = async (id: string | undefined): Promise<void> => {
		if (id == undefined) throw new ServerException('Invalid', 'ID', 'Submit');

		await this.repo.delete({ id } as FindOptionsWhere<T>);
	};
}
