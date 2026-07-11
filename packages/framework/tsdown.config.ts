import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  outDir: "dist",
  dts: true,
  minify: true,
  clean: true,
  // Bundle these dependencies (don't externalize)
  deps: {
    neverBundle: ["zod"],
  },
  // Target modern browsers that support custom elements
  target: "es2020",
  // Output filename
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
});
