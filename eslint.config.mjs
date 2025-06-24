import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import pluginJest from 'eslint-plugin-jest';
import jsdoc from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	tseslint.configs.strict,
	{
		files: ['**/*.ts'],
		plugins: {
			jsdoc,
		},
		rules: {
			'jsdoc/require-asterisk-prefix': ['error', 'always'],
			'jsdoc/require-description': ['error'],
			'jsdoc/require-description-complete-sentence': ['error'],
			'jsdoc/require-param-type': [
				'error',
				{ setDefaultDestructuredRootType: true },
			],
		},
		settings: { jsdoc: { exemptDestructuredRootsFromChecks: true } },
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
	},
	{ files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		languageOptions: { globals: globals.node },
		rules: {
			'no-unused-vars': 'off',
			'no-undef': 'off',
		},
	},
	{
		files: ['**/*.json'],
		plugins: { json },
		language: 'json/json',
		extends: ['json/recommended'],
	},
	{
		files: ['**/*.jsonc'],
		plugins: { json },
		language: 'json/jsonc',
		extends: ['json/recommended'],
	},
	{
		files: ['**/*.json5'],
		plugins: { json },
		language: 'json/json5',
		extends: ['json/recommended'],
	},
	{
		files: ['**/*.md'],
		plugins: { markdown },
		language: 'markdown/gfm',
		extends: ['markdown/recommended'],
	},
	{
		files: ['**/*.spec.js', '**/*.test.js'],
		plugins: { jest: pluginJest },
		languageOptions: {
			globals: pluginJest.environments.globals.globals,
		},
		rules: {
			'jest/no-disabled-tests': 'warn',
			'jest/no-focused-tests': 'error',
			'jest/no-identical-title': 'error',
			'jest/prefer-to-have-length': 'warn',
			'jest/valid-expect': 'error',
		},
	},
]);
