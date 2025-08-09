import { TypeOrmModule } from '@nestjs/typeorm';
import { serverException } from 'utils/error/functions';
import { execute, jestInitialization } from 'utils/test/functions';

import { TestEntity, TestEntityService } from './classes.spec.util';

let testEntityService: TestEntityService, testEntity: TestEntity;

beforeAll(async () => {
	const { module } = await jestInitialization({
		imports: [TypeOrmModule.forFeature([TestEntity])],
		providers: [TestEntityService],
		exports: [TestEntityService],
	});

	testEntityService = module.get(TestEntityService);
});

beforeEach(() => {
	testEntity = new TestEntity({ str: (5).string, num: (128).random });
});

describe('id', () => {
	it('success', async () => {
		const { id } = await testEntityService.create(testEntity);

		await execute(() => testEntityService.id(id), {
			expectations: [
				{
					type: 'toEqual',
					parameters: [
						expect.objectContaining({
							...testEntity,
							id: expect.anything(),
							updatedAt: expect.anything(),
							createdAt: expect.anything(),
						}),
					],
				},
			],
		});
	});

	it('fail due to invalid or empty input', async () => {
		await execute(() => testEntityService.id(undefined), {
			expectations: [
				{
					type: 'toThrow',
					parameters: [serverException('Invalid', 'ID', 'Submit')],
				},
			],
		});
	});
});

describe('find', () => {
	it('success', async () => {
		const { id } = await testEntityService.create(testEntity);

		await execute(() => testEntityService.find({ id }), {
			expectations: [
				{
					type: 'toEqual',
					parameters: [
						expect.arrayContaining([
							expect.objectContaining({
								...testEntity,
								id: expect.anything(),
								updatedAt: expect.anything(),
								createdAt: expect.anything(),
							}),
						]),
					],
				},
				{ type: 'toHaveLength', parameters: [1] },
			],
		});
	});
});

describe('findOne', () => {
	it('success', async () => {
		const { id } = await testEntityService.create(testEntity);

		await execute(() => testEntityService.findOne({ id }), {
			expectations: [
				{
					type: 'toEqual',
					parameters: [
						expect.objectContaining({
							...testEntity,
							id: expect.anything(),
							updatedAt: expect.anything(),
							createdAt: expect.anything(),
						}),
					],
				},
			],
		});
	});
});

describe('create', () => {
	it('success', async () => {
		await execute(() => testEntityService.create(testEntity), {
			expectations: [{ type: 'toBeInstanceOf', parameters: [TestEntity] }],
			onFinish: async (result) => {
				await execute(() => testEntityService.id(result.id), {
					expectations: [
						{
							type: 'toEqual',
							parameters: [result],
						},
					],
				});
			},
		});
	});
});

describe('update', () => {
	it('success', async () => {
		const { id } = await testEntityService.create(testEntity),
			newStr = 'new' + (5).string;

		await execute(() => testEntityService.update({ id }, { str: newStr }), {
			expectations: [{ type: 'toThrow', not: true, parameters: [] }],
			onFinish: async () => {
				await execute(() => testEntityService.id(id), {
					expectations: [
						{ type: 'toHaveProperty', parameters: ['str', newStr] },
					],
				});
			},
		});
	});
});

describe('delete', () => {
	it('success', async () => {
		const { id } = await testEntityService.create(testEntity);
		await execute(() => testEntityService.delete(id), {
			expectations: [{ type: 'toThrow', not: true, parameters: [] }],
			onFinish: async () => {
				await execute(() => testEntityService.id(id), {
					expectations: [{ type: 'toBeNull', parameters: [] }],
				});
			},
		});
	});
});
