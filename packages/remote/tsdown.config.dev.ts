import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  platform: "browser",
  format: "esm",
  dts: true,
  sourcemap: true,
  css: {
    transformer: 'lightningcss'
  },
  deps: {
    neverBundle: [/^@dotslide\//],
  },
  watch: true,
});
