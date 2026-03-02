#!/usr/bin/env bun

export {};

/**
 * Build script for @dotslide/remote client bundle.
 *
 * Outputs a single ESM bundle that includes:
 * - Remote client code (connectToServer, SyncAdapter, LaserOverlay, capture)
 * - Framework store dependencies (SlideshowContext, nanostores)
 * - Protocol types (runtime Zod schemas are tree-shaken if unused)
 *
 * The bundle is served by @dotslide/server at /@dotslide/remote-client.js
 */

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "external",
  naming: {
    entry: "remote-client.js",
  },
  external: [],
});

if (!result.success) {
  console.error("Build failed:");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log("✓ Built @dotslide/remote");
console.log(`  Output: ${result.outputs.map((o) => o.path).join(", ")}`);
