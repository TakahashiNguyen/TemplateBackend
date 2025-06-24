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
import { Class } from 'utils';
import { validateObject } from 'utils/app/functions';
import { ServerException } from 'utils/error';

import {
	ExtendedFindOneOptions,
	ExtendedFindOptions,
	ExtendedSaveOptions,
	FindWhereExtend,
	GetAttributes,
} from './types';

/** Base entity class that provides common fields for all entities. */
export abstract class BaseEntity extends TypeOrmBaseEntity {
	/** Unique identifier for the entity. */
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	/** Creation date record. */
	@CreateDateColumn()
	createdAt!: Date;

	/** Last update date record. */
	@UpdateDateColumn()
	updatedAt!: Date;
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
	private ctor: Class<T>;

	/**
	 * Initiate database methods for entity.
	 *
	 * @param {Repository<T>} repo - Entity's repository.
	 * @param {Class} ctor - Entity's constructor.
	 */
	constructor(repo: Repository<T>, ctor: Class<T>) {
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
	 * @param {string} id - The entity's id.
	 * @returns {Promise<T>} Found entity.
	 * @throws {ServerException} If the id is null or undefined.
	 */
	public readonly id = (id: string): Promise<T> => {
		if (id == null) throw new ServerException('Invalid', 'ID', '');

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
	 * @returns {Promise<T>} An entity match `option` request.
	 */
	public readonly findOne = async (
		options: FindWhereExtend<T, ExtendedFindOneOptions>,
	): Promise<T> => {
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
				: undefined;

		return new this.ctor(
			await this.repo.findOne({ where, order, relations, cache, lock }),
		);
	};

	/**
	 * Get total of entity.
	 *
	 * @example
	 *
	 * ```ts
	 * const count = this.total();
	 * ```
	 *
	 * @returns {Promise<number>} Return a value representing the number of
	 *   entities in table.
	 */
	public readonly total = async (): Promise<number> => {
		return this.repo.count();
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
	 * @param {DeepPartial<GetAttributes<T>>} entity - The saving entity.
	 * @param {ExtendedSaveOptions} options - Entity save options.
	 * @returns {Promise<T>} An entity that created in database.
	 */
	public readonly create = async (
		entity: DeepPartial<GetAttributes<T>>,
		options?: ExtendedSaveOptions,
	): Promise<T> => {
		if (entity == null) throw new ServerException('Invalid', 'Input', '');

		const { raw = false, validate = true } = options || {},
			forgedEntity = raw ? entity : new this.ctor(entity),
			validatedEntity = (
				validate && !raw ? await validateObject(forgedEntity) : forgedEntity
			) as DeepPartial<T>;

		return new this.ctor(await this.repo.save(validatedEntity));
	};

	// Update

	/**
	 * Push many entities to field's array.
	 *
	 * @example
	 *
	 * ```ts
	 * this.pushMany(entityId, field, entities);
	 * ```
	 *
	 * @param {string} id - The id of entity.
	 * @param {K} field - The pushing field.
	 * @param {T[K]} entities - The push entities.
	 */
	public readonly pushMany = async <K extends keyof T>(
		id: string,
		field: K,
		entities: T[K],
	): Promise<void> => {
		const obj = await this.id(id);
		(obj[field] as T[K][]).push(entities);
		await this.update({ id } as FindOptionsWhere<T>, obj);
	};

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
	 * @param {ExtendedSaveOptions} options - Update entity options.
	 */
	public readonly update = async (
		targetEntity: FindOptionsWhere<T>,
		updatedEntity: DeepPartial<T>,
		options?: ExtendedSaveOptions,
	): Promise<void> => {
		if (
			updatedEntity != null &&
			Object.keys(updatedEntity).length &&
			targetEntity != null &&
			Object.keys(targetEntity).length &&
			(await this.find(targetEntity)).length
		)
			await this.create({ ...targetEntity, ...updatedEntity }, options);
	};

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
	 * @param {string} id - The entity identifier string.
	 * @returns {Promise<void>} Resolves when the entity is deleted.
	 * @throws {ServerException} If the id is null or undefined.
	 */
	public readonly delete = async (id: string): Promise<void> => {
		if (id == null) throw new ServerException('Invalid', 'ID', '');

		await this.repo.delete({ id } as FindOptionsWhere<T>);
	};
}
