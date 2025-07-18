import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['types/index.ts'],
	clean: true,
	external: ['@nestjs/microservices'],
	dts: {
		entry: 'types/index.ts',
	},
	minify: true,
	format: ['cjs', 'esm'],
	platform: 'neutral',
});
