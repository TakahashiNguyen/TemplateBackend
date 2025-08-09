import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), tailwindcss()],
	optimizeDeps: {
		force: true,
	},
	build: {
		minify: true,
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					if (id.includes('node_modules')) {
						const modulePath = id.split('node_modules/')[1],
							topLevelFolder = modulePath?.split('/')[0];

						if (topLevelFolder !== '.pnpm') return topLevelFolder;

						const scopedPackageName = modulePath?.split('/')[1],
							chunkName =
								scopedPackageName?.split('@')[
									scopedPackageName.startsWith('@') ? 1 : 0
								];

						return chunkName;
					}
				},
			},
		},
	},
	server: {
		host: '127.0.0.1',
		fs: {
			strict: true,
		},
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
