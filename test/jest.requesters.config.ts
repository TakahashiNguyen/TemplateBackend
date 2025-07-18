import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	testMatch: ['**/?(*.)+(controller.spec).ts', '**/?(*.)+(resolver.spec).ts'],
	rootDir: process.cwd(),
	reporters: [
		'default',
		['github-actions', { silent: false }],
		[
			'jest-junit',
			{ outputDirectory: 'reports', outputName: 'requesters.xml' },
		],
	],
	collectCoverage: true,
	coverageReporters: [['text', { file: 'requesters.txt' }]],
	collectCoverageFrom: ['src/**/*.controller.ts', 'src/**/*.resolver.ts'],
	forceExit: true,
};

export default config;
