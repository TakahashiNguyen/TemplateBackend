import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import { defineConfig } from 'tsup';

const entry = 'src/index.ts',
	externalPackages = [
		'@nestjs/graphql',
		'@nestjs/common',
		'@nestjs/passport',
		'@node-rs/argon2',
		'jws',
	];

export default defineConfig({
	entry: [entry],
	dts: { entry },
	format: ['esm', 'cjs'],
	platform: 'browser',
	clean: true,
	minify: true,
	treeshake: {
		moduleSideEffects: false,
	},
	external: [/^@nestjs\/(?!graphql|common|passport).+$/],
	esbuildPlugins: [polyfillNode()],
	esbuildOptions(options) {
		options.alias = Object.assign(
			{},
			...externalPackages.map((i) => ({ [i]: './src/dummies.ts' })),
		);
	},
});
