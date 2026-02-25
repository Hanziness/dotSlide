import {
  cpSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const SRC = "src";

// 1. Clean dist
rmSync(DIST, { recursive: true, force: true });

// 2. Copy src/ into dist/src/  (preserves structure)
cpSync(SRC, join(DIST, SRC), { recursive: true });

// 3. Copy barrel entry-point files into dist/
for (const file of ["index.ts", "controls.ts", "dev.ts"]) {
  if (existsSync(file)) {
    cpSync(file, join(DIST, file));
  }
}

// 4. Fix the CSS import path so dist/src/index.css points to ../styles.css
//    (in src/ it's ../dist/styles.css — after copying into dist/ that becomes wrong)
const cssPath = join(DIST, SRC, "index.css");
if (existsSync(cssPath)) {
  const css = readFileSync(cssPath, "utf8");
  writeFileSync(cssPath, css.replace("../dist/styles.css", "../styles.css"));
}
