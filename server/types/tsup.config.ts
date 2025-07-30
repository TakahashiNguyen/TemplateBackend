import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['main.ts'],
	clean: true,
	dts: {
		entry: 'main.ts',
	},
	minify: true,
	format: ['cjs', 'esm'],
	platform: 'neutral',
});
