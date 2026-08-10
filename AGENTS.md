# AGENTS.md - Coding Agent Instructions for dotslide

## Project Overview

dotslide is a framework-agnostic slideshow framework built with Web Components. Its goal is to enable creating fast and portable, yet modern presentations using custom elements, and presenting those with the help of a mobile controller. It is a **TypeScript monorepo** managed by **Bun** and **Turborepo**.

### Monorepo Structure

```
apps/
  example/          # Demo presentation using the framework (@dotslide/example)
  controller/       # Svelte-based controller web app - not yet implemented
  server/           # Controller server - not yet implemented
packages/
  framework/        # Core framework package (@dotslide/framework)
    src/
      elements/     # Vanilla Web Components (custom elements, ds-* prefix)
        controls/   # SlideControls, Overlay, Button, KeyboardHandler
        layout/     # Flex, Item, List, ListItem
        media/      # Image, Video, Counter, Reference
        overlay/    # Loader
        widgets/    # Progress, CurrentSlide, TotalSlides, CurrentSection
      store/        # Nanostores-based state management
      styles/       # Shared CSS consumed via ?raw imports
      utils/        # Utility functions (generateId, getDataTags, injectStyles)
    index.ts        # Main package entry - registers and re-exports all elements
    themes/         # Prebuilt CSS themes
    dotslide.html-data.json  # Custom element metadata (for IDE tooling)
```

## Build, Dev, and Lint Commands

### Package Manager

**Bun** (v1.3.6+) is the package manager. Use `bun install` for dependencies.

### Root Commands

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `bun run build` | Build all packages via Turborepo   |
| `bun run dev`   | Start dev servers for all packages |

### Framework Package (`packages/framework`)

| Command       | Description                 |
| ------------- | --------------------------- |
| `bun run build` | Bundle via tsdown           |
| `bun run dev`   | Watch mode via `tsdown --watch` |

### Example App (`apps/example`)

| Command           | Description            |
| ----------------- | ---------------------- |
| `bun run dev`     | Start Astro dev server |
| `bun run build`   | Build the Astro site   |
| `bun run preview` | Preview the built site |

### Linting and Formatting

**Biome** (v2.3.14) handles both linting and formatting.

```bash
# Lint the codebase
bunx biome lint .

# Format the codebase
bunx biome format --write .

# Check both lint and format without writing
bunx biome check .

# Fix all auto-fixable issues
bunx biome check --write .
```

### Type Checking

```bash
turbo run check-types
```

The framework package uses a plain TypeScript config (`tsdown` handles bundling). The example app extends `astro/tsconfigs/strict`.

### Tests

There are **no tests** currently. No test framework (Vitest, Jest, Playwright) is configured. If adding tests, use Vitest (most compatible with Bun + Astro).

## Code Style Guidelines

### Formatting (enforced by Biome)

- **Indent**: 2 spaces (no tabs in code; Astro template markup may use tabs)
- **Quotes**: Double quotes for JS/TS strings
- **Semicolons**: Used (Biome default)
- **Trailing commas**: Used where valid
- **Line width**: Biome default (80)

### Imports

- **Organize imports**: Biome auto-organizes imports (`organizeImports: "on"`)
- **Elements import their own CSS** as `?raw` string modules and inject it via `injectStyles`:
  ```ts
  import progressCss from "./progress.css?raw";
  import { injectStyles } from "../../utils/styles.js";
  injectStyles(progressCss, "progress");
  ```
- **Relative paths** within the same package; workspace references across packages:
  ```ts
  import { useSlideshowContext } from "../store/context/slideshow.js"; // within package
  import { Slideshow, Slide } from "@dotslide/framework"; // cross-package
  ```
- **`.js` extensions** on relative import specifiers (ESM/tsdown convention):
  ```ts
  import { getDataTags } from "../../utils/index.js";
  ```

### TypeScript

- **Strict mode** in both packages
- **Explicit return types** on exported functions and class methods
- **Custom element classes** extend `HTMLElement` and expose typed attributes/props
- **Store context** via nanostores `mapCreator`-style factories, typed with generics
- **JSDoc comments** on types, exported functions, and complex logic
- Avoid `any`; use proper types or `unknown` with narrowing
- **Register elements in `HTMLElementTagNameMap`** so `document.querySelector("ds-slide")` is typed

### Naming Conventions

| Element          | Convention             | Example                               |
| ---------------- | ---------------------- | ------------------------------------- |
| Custom Elements  | ds-* prefix (kebab-case) | `ds-slideshow`, `ds-slide`, `ds-button` |
| TypeScript files | camelCase              | `slideshow.ts`, `button.ts`            |
| Directories      | camelCase/lowercase    | `store/`, `utils/`, `elements/`        |
| Classes          | PascalCase             | `Slideshow`, `SlideControls`, `DsButton` |
| Functions        | camelCase              | `generateId()`, `getDataTags()`       |
| Types/Interfaces | PascalCase             | `SlideshowContext`, `NavigationNode`  |
| Constants        | camelCase              | `slideshowContext`                    |
| CSS variables    | kebab-case with prefix | `--slide-width`, `--slideshow-root`   |
| Data attributes  | kebab-case             | `data-slide`, `data-slideshow-root`   |

### Web Components

- **Custom element classes** extend `HTMLElement`, with a `connectedCallback` (and other lifecycle hooks) for setup:
  ```ts
  export class Slideshow extends HTMLElement {
    private _unsubscribe?: () => void;

    connectedCallback() {
      // subscribe to stores, resolve nested elements, wire attributes
    }
    disconnectedCallback() {
      this._unsubscribe?.();
    }
  }
  customElements.define("ds-slideshow", Slideshow);
  ```
- **Lifecycle methods**: `connectedCallback()`, `disconnectedCallback()`, `attributeChangedCallback()`, `adoptedCallback()`. Static `observedAttributes` for reactive attributes.
- **Attribute handling**: read via `getAttribute()`, observe with `observedAttributes`; use `data-*` attributes (`data-display`, `data-within`) for configuration.
- **Event handling**: dispatch custom events (`new CustomEvent`) for component communication; listen with `addEventListener`.
- **CSS scoping**: per-element CSS files imported as `?raw` and injected via `injectStyles(css, id)` (scoped by a shared id, not Shadow DOM by default). CSS variables (`--slide-width`, `--slide-scale`) are used for dynamic sizing.
- **Composition**: elements resolve related elements via `customElements.whenDefined(...)` + `.closest("ds-slideshow")` queries.

### State Management

- **Nanostores** with `mapCreator` pattern for shared state
- Context stores (`createSlideshowContext`, `createSlideContext`, `createSectionContext`) created per element root and exposed via `use*Context`
- Subscribe with `.subscribe()`, read with `.get()`, update with `.setKey()`
- Store lives in `packages/framework/src/store/`

### Error Handling

- **Early returns with guards** for null DOM queries (`if (element === null) return`)
- **`console.warn()`** for non-fatal issues (element used outside its supported parent)
- **`console.debug()`** for development logging

### Biome Overrides for Framework Files

In `.astro`, `.svelte`, and `.vue` files (the example and controller apps only), these rules are disabled for Biome compatibility (as per the Biome recommendations):

- `style/useConst` - Astro frontmatter requires `let` for reactive assignments
- `style/useImportType` - Not compatible with Astro/Svelte compilation
- `correctness/noUnusedVariables` - Astro frontmatter exports appear unused
- `correctness/noUnusedImports` - Same reason as above

The framework package itself is plain TypeScript, so these overrides do not apply there.

### CSS / Styling

- **Plain CSS** bundled by tsdown; per-element stylesheets live alongside their element and are imported as `?raw`
- Injected at runtime via `injectStyles(css, id)` from `utils/styles.ts`
- CSS variables (`--slide-width`, `--slide-scale`) are used for dynamic sizing
- The example app uses Astro + UnoCSS for its own demo styling (framework-agnostic)

## Key Patterns to Follow

1. **New elements**: Place in `packages/framework/src/elements/` under the matching subdirectory, export the class from `index.ts`, and call `customElements.define("ds-*", Element)` there so importing the package registers everything
2. **Custom element registration**: `customElements.define()` in `src/index.ts`; augment `HTMLElementTagNameMap` for typed queries
3. **Attribute-based API**: expose configuration through `data-*` attributes, read in `connectedCallback`
4. **Event-driven communication**: dispatch and listen for CustomEvents; use nanostore context for shared slideshow state
5. **Package exports**: The framework exposes `"."` (main bundle) plus `"./themes/*"` and `"./dotslide.html-data.json"`
