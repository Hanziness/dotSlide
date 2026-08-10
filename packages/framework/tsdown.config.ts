import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "lightningcss";
import { defineConfig, type TsdownPlugin } from "tsdown";

const rawSuffix = "?raw";

/**
 * Resolves `?raw` imports (e.g. `./button.css?raw`) to the minified CSS text.
 * Rolldown's built-in moduleTypes key by extension, so `.css?raw` won't
 * match `.css` — a small plugin is the reliable route.
 * Uses lightningcss for proper CSS minification (whitespace removal, shortening).
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
    const minified = transform({
      filename: id,
      code: Buffer.from(css),
      minify: true,
    }).code.toString();
    return {
      code: `export default ${JSON.stringify(minified)};`,
      moduleSideEffects: false,
    };
  },
};

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core.ts",
    "controls/button": "src/elements/controls/button.ts",
    "controls/keyboard-handler": "src/elements/controls/keyboard-handler.ts",
    "controls/overlay": "src/elements/controls/overlay.ts",
    "controls/slide-controls": "src/elements/controls/slide-controls.ts",
    "layout/flex": "src/elements/layout/flex.ts",
    "layout/item": "src/elements/layout/item.ts",
    "layout/list": "src/elements/layout/list.ts",
    "layout/list-item": "src/elements/layout/list-item.ts",
    "media/counter": "src/elements/media/counter.ts",
    "media/image": "src/elements/media/image.ts",
    "media/reference": "src/elements/media/reference.ts",
    "media/video": "src/elements/media/video.ts",
    "overlay/loader": "src/elements/overlay/loader.ts",
    section: "src/elements/section.ts",
    slide: "src/elements/slide.ts",
    "slide-template": "src/elements/slide-template.ts",
    slideshow: "src/elements/slideshow.ts",
    step: "src/elements/step.ts",
    "widgets/current-section": "src/elements/widgets/current-section.ts",
    "widgets/current-slide": "src/elements/widgets/current-slide.ts",
    "widgets/progress": "src/elements/widgets/progress.ts",
    "widgets/total-slides": "src/elements/widgets/total-slides.ts",
  },
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
