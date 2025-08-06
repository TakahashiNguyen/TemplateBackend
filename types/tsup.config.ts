import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["main.ts"],
  dts: {
    entry: "main.ts",
  },
  format: ["cjs", "esm"],
  platform: "neutral",
});
