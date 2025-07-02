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
import { GetAttributes, Subtract } from 'utils/app/types';
import { ServerException } from 'utils/error';

import {
	ExtendedFindOneOptions,
	ExtendedFindOptions,
	ExtendedSaveOptions,
	FindWhereExtend,
} from './types';

export { TypeOrmBaseEntity };

/** Base entity class that provides common fields for all entities. */
export abstract class BaseEntity extends TypeOrmBaseEntity {
	/** Unique identifier for the entity. */
	@PrimaryGeneratedColumn('uuid')
	@IsOptional()
	id?: string;

	/** Creation date record. */
	@CreateDateColumn()
	@IsOptional()
	createdAt?: Date;

	/** Last update date record. */
	@UpdateDateColumn()
	@IsOptional()
	updatedAt?: Date;

	/**
	 * Create an instance of BaseEntity.
	 *
	 * @param {GetAttributes<BaseEntity>} object - Input base entity fields.
	 */
	constructor(object: GetAttributes<Subtract<BaseEntity, TypeOrmBaseEntity>>) {
		super();
		this.id = object?.id;
		this.createdAt = object?.createdAt;
		this.updatedAt = object?.updatedAt;
	}
}

/**
 * Base class for database requests.
 *
 * @template T - Type of the entity.
 */
export abstract class DatabaseRequests<T extends BaseEntity> {
	/** Entity relationships. */
	private relations: string[];

	/** Entity's repository. */
	private repo: Repository<T>;

	/** Entity's constructor. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private ctor: new (...args: any[]) => T;

	/**
	 * Initiate database methods for entity.
	 *
	 * @param {Repository<T>} repo - Entity's repository.
	 * @param {Class} ctor - Entity's constructor.
	 */
	constructor(repo: Repository<T>, ctor: typeof this.ctor) {
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
		if (id == undefined) throw new ServerException('Invalid', 'ID', '');

		return this.findOne({ id, cache: false } as FindWhereExtend<
			T,
			ExtendedFindOneOptions
		>);
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
		options?: FindWhereExtend<T, ExtendedFindOptions>,
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
			where = new ctor(entity) as FindOptionsWhere<T>,
			lock: FindOneOptions['lock'] = writeLock
				? { mode: 'pessimistic_write' }
				: undefined;

		return (
			await this.repo.find({ where, take, skip, order, relations, cache, lock })
		).map((i) => new ctor(i));
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
		options: FindWhereExtend<T, ExtendedFindOneOptions>,
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
			where = new ctor(entity) as FindOptionsWhere<T>,
			lock: FindOneOptions['lock'] = writeLock
				? { mode: 'pessimistic_write' }
				: undefined,
			found = await this.repo.findOne({ where, order, relations, cache, lock });

		return found != null ? new this.ctor(found) : undefined;
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
	 * @param {T} entity - The saving entity.
	 * @param {ExtendedSaveOptions} options - Entity save options.
	 * @returns {Promise<T>} An entity that created in database.
	 */
	protected readonly $create = async (
		entity: T,
		options?: ExtendedSaveOptions,
	): Promise<T> => {
		const { raw = false, validate = true } = options || {},
			forgedEntity = raw ? entity : new this.ctor(entity),
			validatedEntity = (
				validate && !raw ? await validateObject(forgedEntity) : forgedEntity
			) as DeepPartial<T>;

		return new this.ctor(await this.repo.save(validatedEntity));
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
	 * @param {string | undefined} id - Target entity id.
	 * @param {DeepPartial<T>} updatedEntity - Updated entity.
	 * @param {ExtendedSaveOptions} options - Update entity options.
	 */
	protected readonly $update = async (
		id: string | undefined,
		updatedEntity: DeepPartial<T>,
		options?: ExtendedSaveOptions,
	): Promise<void> => {
		if (updatedEntity != null && Object.keys(updatedEntity).length && id)
			await this.create(new this.ctor({ id, ...updatedEntity }), options);
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
		await this.repo.delete({ id } as FindOptionsWhere<T>);
	};
}
