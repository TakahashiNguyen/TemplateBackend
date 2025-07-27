import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	documents: './src/graphQL/**/*.graphql',
	schema: 'src/schema.gql',
	generates: {
		'src/graphQL/types.ts': {
			plugins: [
				'typescript-document-nodes',
				'typescript',
				'typescript-operations',
			],
			config: {
				typesSuffix: '_gql',
				enumsAsTypes: true,
			},
		},
	},
};

export default config;
