import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import jsdoc from 'eslint-plugin-jsdoc';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['**/*.js', 'src/graphQL/**/*.ts']),
	// @ts-expect-error error-free expression
	tseslint.configs.strict,
	{
		files: ['**/*.ts'],
		plugins: {
			jsdoc,
			js,
		},
		extends: ['js/recommended'],
		languageOptions: { globals: globals.node },
		rules: {
			'jsdoc/check-access': 'error',
			'jsdoc/check-param-names': ['error', { enableFixer: true }],
			'jsdoc/check-types': ['error'],
			'jsdoc/implements-on-classes': ['error'],
			'jsdoc/lines-before-block': ['error', { ignoreSingleLines: true }],
			'jsdoc/no-blank-blocks': ['error', { enableFixer: true }],
			'jsdoc/require-asterisk-prefix': ['error', 'always'],
			'jsdoc/require-description': ['error', { contexts: ['any'] }],
			'jsdoc/require-description-complete-sentence': ['error'],
			'jsdoc/require-example': ['error', { checkConstructors: false }],
			'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
			'jsdoc/require-jsdoc': [
				'error',
				{
					contexts: [
						'TSInterfaceDeclaration',
						'TSTypeAliasDeclaration',
						'TSPropertySignature',
						'TSMethodSignature',
						'TSMethodDeclaration',
						'TSEnumDeclaration',
						'PropertyDefinition',
					],
					require: {
						ClassDeclaration: true,
						ClassExpression: true,
						FunctionExpression: true,
						FunctionDeclaration: true,
						MethodDefinition: true,
						ArrowFunctionExpression: false,
					},
				},
			],
			'jsdoc/require-param': ['error'],
			'jsdoc/require-param-description': ['error'],
			'jsdoc/require-param-name': ['error'],
			'jsdoc/require-param-type': ['error', { contexts: ['any'] }],
			'jsdoc/require-returns': ['error', { contexts: ['any'] }],
			'jsdoc/require-returns-check': ['error'],
			'jsdoc/require-returns-description': ['error'],
			'jsdoc/require-returns-type': ['error', { contexts: ['any'] }],
			'jsdoc/require-template': ['error', { requireSeparateTemplates: true }],
			'jsdoc/require-throws': 'error',
			'jsdoc/valid-types': ['error'],
			'no-unused-vars': 'off',
			'no-undef': 'off',
			'no-redeclare': 'off',
			'@typescript-eslint/no-redeclare': ['error'],
		},
		settings: {
			jsdoc: { exemptDestructuredRootsFromChecks: true, mode: 'typescript' },
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
]);
