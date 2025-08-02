import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "url";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    visualizer({}),
    nodePolyfills({
      exclude: ["fs"],
      globals: { Buffer: true, process: true, global: true },
    }),
    wasm(),
    topLevelAwait(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: { "top-level-await": true },
    },
    force: true,
  },
  esbuild: {
    supported: { "top-level-await": true },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            const modulePath = id.split("node_modules/")[1],
              topLevelFolder = modulePath?.split("/")[0];

            if (topLevelFolder !== ".pnpm") return topLevelFolder;

            const scopedPackageName = modulePath?.split("/")[1],
              chunkName =
                scopedPackageName?.split("@")[
                  scopedPackageName.startsWith("@") ? 1 : 0
                ];

            return chunkName;
          }
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      process: "process/browser",
    },
  },
  define: {
    "process.versions": JSON.stringify({ node: process.versions.node }),
		"process.env": JSON.stringify({})
  },
});
