import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type TsdownPlugin } from "tsdown";

const rawSuffix = "?raw";

/**
 * Resolves `?raw` imports (e.g. `./button.css?raw`) to the raw file text.
 * Rolldown's built-in moduleTypes key by extension, so `.css?raw` won't
 * match `.css` — a small plugin is the reliable route.
 */
const rawImportPlugin: TsdownPlugin = {
  name: "dotslide:raw-import",
  resolveId(source, importer) {
    if (!source.endsWith(rawSuffix) || !importer) return null;
    const file = source.slice(0, -rawSuffix.length);
    const resolved = importer.startsWith("file://")
      ? fileURLToPath(new URL(file, importer))
      : resolve(dirname(importer), file);
    // tell Rolldown to watch the file so changes trigger rebuild
    this.addWatchFile(resolved);
    return `${resolved}${rawSuffix}`;
  },
  load(id) {
    if (!id.endsWith(rawSuffix)) return null;
    const css = readFileSync(id.slice(0, -rawSuffix.length), "utf8");
    return {
      code: `export default ${JSON.stringify(css)};`,
      moduleSideEffects: false,
    };
  },
};

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  outDir: "dist",
  dts: true,
  minify: true,
  clean: true,
  plugins: [rawImportPlugin],
  // Bundle these dependencies (don't externalize)
  deps: {
    neverBundle: ["zod"],
  },
  // Target modern browsers that support custom elements
  target: "es2020",
  // Output filename
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
});
