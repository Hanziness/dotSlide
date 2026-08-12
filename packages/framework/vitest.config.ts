import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "lightningcss";
import { defineConfig, type Plugin } from "vite";

const rawSuffix = "?raw";

const rawImportPlugin: Plugin = {
  name: "dotslide:raw-import",
  resolveId(source, importer) {
    if (!source.endsWith(rawSuffix) || !importer) return null;
    const file = source.slice(0, -rawSuffix.length);
    const resolved = importer.startsWith("file://")
      ? fileURLToPath(new URL(file, importer))
      : resolve(dirname(importer), file);
    return `${resolved}${rawSuffix}`;
  },
  load(id) {
    if (!id.endsWith(rawSuffix)) return null;
    const css = readFileSync(id.slice(0, -rawSuffix.length), "utf8");
    const minified = transform({
      filename: id,
      code: Buffer.from(css),
      minify: true,
    }).code.toString();
    return `export default ${JSON.stringify(minified)};`;
  },
};

export default defineConfig({
  plugins: [rawImportPlugin],
  test: {
    environment: "jsdom",
    include: ["test/unit/**/*.test.ts"],
    globals: false,
  },
});
