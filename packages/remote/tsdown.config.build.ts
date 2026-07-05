import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  platform: "browser",
  dts: true,
  css: {
    transformer: 'lightningcss',
    minify: true
  },
  deps: {
    neverBundle: [/^@dotslide\//],
  },
  minify: true,
});
