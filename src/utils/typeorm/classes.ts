import {
	CreateDateColumn,
	DeepPartial,
	FindOneOptions,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	UpdateDateColumn,
  BaseEntity as TypeOrmBaseEntity
} from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { validateObject } from 'utils/app/functions';
import { ServerException } from 'utils/error';

import {
	ExtendedFindOneOptions,
	ExtendedFindOptions,
	ExtendedSaveOptions,
	FindWhereExtend,
	NonFunctionProperties,
} from './types';

/**
 * Base entity class that provides common fields for all entities
 * @abstract
 */
export abstract class BaseEntity extends TypeOrmBaseEntity {
	/**
	 * Unique identifier for the entity
	 */
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	/**
	 * Creation date record
	 */
	@CreateDateColumn()
	createdAt!: Date;

	/**
	 * Last update date record
	 */
	@UpdateDateColumn()
	updatedAt!: Date;
}

/**
 * Base class for database requests
 * @abstract
 * @template T - Type of the entity
 */
export abstract class DatabaseRequests<T extends BaseEntity> {
	/**
	 * Entity relationships
	 */
	private relations: string[];

	/**
	 * Exploring entity relationships
	 * @param {RelationMetadata} input - the entity with relationships
	 * @param {string} parentName - discovered relationships
	 * @param {string} avoidNames - relationships must be avoid
	 * @return {Array<string>} array of relationships
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

	/**
	 * Initiate database for entity
	 */
	constructor(
		private repo: Repository<T>,
		private ctor: new (...args: unknown[]) => T,
	) {
		this.relations = this.repo.metadata.relations
			.map((i) => this.exploreEntityMetadata(i))
			.flat();
	}

	// Read
	/**
	 * Get entity from id
	 * @param {string} id - the entity's id
	 * @throws {ServerException} if the id is null or undefined
	 * @return {Promise<T>} found entity
	 */
	public readonly id = (id: string): Promise<T> => {
		if (id == null) throw new ServerException('Invalid', 'ID', '');

		return this.findOne({ id, cache: false } as FindWhereExtend<
			T,
			ExtendedFindOneOptions
		>);
	};

	/**
	 * Finding objects
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T[]>} array of found objects
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
	 * Finding an entity
	 * @param {FindWhereExtended<T>} options - function's option
	 * @return {Promise<T>}
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
	 * Get total of entity
	 * @return {Promise<number>}
	 */
	public readonly total = async (): Promise<number> => {
		return this.repo.count();
	};

	// Create
	/**
	 * Saving an entity
	 * @param {NonFunctionProperties<T>} entity - the saving entity
	 */
	public readonly create = async (
		entity: DeepPartial<NonFunctionProperties<T>>,
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
	 * Push many entities to field's array
	 * @param {string} id - the id of entity
	 * @param {K} field - the pushing field
	 * @param {T[K]} entities - the push entities
	 */
	public readonly pushMany = async <K extends keyof T>(
		id: string,
		field: K,
		entities: T[K],
	) => {
		const obj = await this.id(id);
		(obj[field] as T[K][]).push(entities);
		await this.update({ id } as FindOptionsWhere<T>, obj);
	};

	/**
	 * Updating entity
	 * @param {DeepPartial<T>} targetEntity - target entity
	 * @param {DeepPartial<T>} updatedEntity - updated entity
	 */
	public readonly update = async (
		targetEntity: FindOptionsWhere<T>,
		updatedEntity: DeepPartial<T>,
		options?: ExtendedSaveOptions,
	) => {
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
	 * Removing an entity by identifier string
	 * @param {string} id - the entity identifier string
	 * @throws {ServerException} if the id is null or undefined
	 * @return {Promise<void>} resolves when the entity is deleted
	 */
	public readonly delete = async (id: string): Promise<void> => {
		if (id == null) throw new ServerException('Invalid', 'ID', '');

		await this.repo.delete({ id } as FindOptionsWhere<T>);
	};
}
