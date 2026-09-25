# @dotslide/framework

## 0.3.1

### Patch Changes

- f24d2fb: Fix fullscreen toggle showing both icons

## 0.3.0

### Minor Changes

- f9b3b1c: Framework bundle shrinks from 100.7 KB raw / 27.2 KB gzip to 35.8 KB raw / 10.5 KB gzip by consuming `@dotslide/protocol`'s valibot schemas instead of zod's. The dist remains fully self-contained (no import map needed). `peerDependencies.zod` removed — consumers extending protocol schemas install valibot themselves.
- 2214cdc: Drop unused public helper functions that helped generate DOM attributes (they were only used in the old Astro codebase): `getDataTags`, `getComponentDataAttribute` and `getSelector`
- f9b3b1c: Use Valibot validators instead of Zod. This should help reduce the bundle size.

### Patch Changes

- f9b3b1c: Add text fixtures for CDN-based loading to ensure that single-file presentations don't break
- f2ddfc8: Bundle runtime dependencies into the ESM module so CDN uses work.
- 470fdc9: Add automatic Custom Elements Manifest generation
- Updated dependencies [f9b3b1c]
  - @dotslide/protocol@0.2.0

## 0.2.2

### Patch Changes

- e369122: Minify component CSS via lightningcss
- c89c80c: Add unit and UI testing via Vitest and Playwright
- d831a2f: Fix scaling, use stacked grid for slide positioning
- Updated dependencies [e9de65f]
  - @dotslide/protocol@0.1.2

## 0.2.1

### Patch Changes

- cc5904d: Add MIT license to published packages
- bda3b1e: Update package.json files
- Updated dependencies [cc5904d]
- Updated dependencies [bda3b1e]
  - @dotslide/protocol@0.1.1

## 0.2.0

### Minor Changes

- 6178441: Add slide templating features
- c17aa90: Migrate framework to vanilla Web Components

### Patch Changes

- f845237: Add fullscreen toggle button to slideshow controls
- 5672ab5: Improve slide controls UI and make UI font explicit (`--ds-font-ui` vs `--ds-font-content`)

## 0.1.0

### Minor Changes

- ac7bc75: Initial release
