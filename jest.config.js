/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
	rootDir: '.',
	moduleNameMapper: {
		'@backend/test': '<rootDir>/test/test.module.ts',
		'@backend/(.*)': '<rootDir>/src/$1',
	},
	detectOpenHandles: true,
};
