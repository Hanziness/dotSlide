# AGENTS.md - Coding Agent Instructions for dotslide

## Project Overview

dotslide is an Astro-based slideshow/presentation framework. Its goal is to enable creating fast and portable, yet modern presentations using Astro, and presenting those with the help of a mobile controller. It is a **TypeScript monorepo** managed by **Bun** and **Turborepo**.

### Monorepo Structure

```
apps/
  example/          # Demo presentation using the framework (@dotslide/example)
  controller/       # Svelte-based controller web app - not yet implemented
  server/           # Controller server - not yet implemented
packages/
  framework/        # Core framework package (@dotslide/framework)
    src/
      components/   # Reusable Astro components (Section, Image, Progress)
      dev/          # Development-only controls (SlideControls, Prev, Next)
      overlay/      # Overlay positioning components
      store/        # Nanostores-based state management
      utils/        # Utility functions (generateId, getDataTags)
    index.ts        # Main package entry - re-exports public components
    controls.ts     # Secondary entry point for dev controls
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

| Command             | Description                                 |
| ------------------- | ------------------------------------------- |
| `bun run build:css` | Build UnoCSS styles (minified)              |
| `bun run dev`       | Watch mode for UnoCSS                       |
| `bun run dev:setup` | Wait for CSS build before dev server starts |

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

TypeScript extends `astro/tsconfigs/strict` in both the framework and example app.

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
- **Named exports preferred**: Components are re-exported as named exports from barrel files
  ```ts
  export { default as Root } from "./src/Root.astro";
  ```
- **Relative paths** within the same package; workspace references across packages:
  ```ts
  import { slideshowContext } from "../store"; // within package
  import { Root, Slide } from "@dotslide/framework"; // cross-package
  ```
- **Secondary entry points** for feature groups:
  ```ts
  import { SlideControls } from "@dotslide/framework/controls";
  ```

### TypeScript

- **Strict mode**: `astro/tsconfigs/strict` is used everywhere
- **Explicit return types** on exported utility functions
- **`interface Props`** for simple Astro component props (Astro convention)
- **Zod schemas** (`PropSchema`) for components needing runtime validation:

  ```ts
  import { z } from "astro/zod";

  export const PropSchema = z.object({
    level: z.number().int().min(0).max(6),
    title: z.string().optional(),
  });

  type Props = z.output<typeof PropSchema>;
  PropSchema.parse(Astro.props); // throws on invalid props
  ```

- **JSDoc comments** on types, exported functions, and complex logic
- Avoid `any`; use proper types or `unknown` with narrowing

### Naming Conventions

| Element          | Convention             | Example                               |
| ---------------- | ---------------------- | ------------------------------------- |
| Astro components | PascalCase files       | `Root.astro`, `SlideControls.astro`   |
| TypeScript files | camelCase              | `index.ts`, `controls.ts`             |
| Directories      | camelCase/lowercase    | `store/`, `utils/`, `dev/`            |
| Functions        | camelCase              | `generateId()`, `getDataTags()`       |
| Types/Interfaces | PascalCase             | `SlideshowContext`, `OverlayLocation` |
| Constants        | camelCase              | `slideshowContext`                    |
| CSS variables    | kebab-case with prefix | `--slide-width`, `--slideshow-root`   |
| Data attributes  | kebab-case             | `data-slide`, `data-slideshow-root`   |

### Astro Components

- **Frontmatter** (between `---` fences): imports, types, props validation, server-side logic
- **Template**: HTML with Astro expressions, UnoCSS utility classes
- **`<style>`**: Scoped CSS by default; use `is:global` only when necessary
- **`<script>`**: Client-side interactivity; imports from store/utils
- CSS variables (`--slide-width`, `--slide-scale`) are used for dynamic sizing
- Use `class:list` for conditional class application

### State Management

- **Nanostores** with `mapCreator` pattern for shared state
- Single `slideshowContext` store holds presentation state
- Subscribe with `.subscribe()`, read with `.get()`, update with `.setKey()`
- Store lives in `packages/framework/src/store/index.ts`

### Error Handling

- **Zod `.parse()`** for prop validation (throws `ZodError` on invalid input)
- **Early returns with guards** for null DOM queries (`if (element === null) return`)
- **`console.warn()`** for non-fatal issues (missing DOM elements)
- **`console.debug()`** for development logging

### Biome Overrides for Framework Files

In `.astro`, `.svelte`, and `.vue` files, these rules are disabled for Biome compatibility (as per the Biome recommendations):

- `style/useConst` - Astro frontmatter requires `let` for reactive assignments
- `style/useImportType` - Not compatible with Astro/Svelte compilation
- `correctness/noUnusedVariables` - Astro frontmatter exports appear unused
- `correctness/noUnusedImports` - Same reason as above

### CSS / Styling

- **UnoCSS** with `presetWind4` (Tailwind-like utilities) and `presetIcons` (Lucide icons)
- Icon syntax: `class="i-lucide:chevron-right"`
- Framework CSS is built separately via `unocss --minify` to `dist/styles.css`
- CSS reset is applied via UnoCSS (`preflights.reset: true`)

## Key Patterns to Follow

1. **New components**: Place in `packages/framework/src/components/` and re-export from `index.ts` or `controls.ts`
2. **Data attributes**: Use `getDataTags()` utility for component identification in the DOM
3. **Prop validation**: Use Zod schemas for components with complex or constrained props
4. **Client interactivity**: Use `<script>` blocks with nanostores subscriptions; query DOM with `data-*` attribute selectors
5. **Package exports**: The framework exposes two entry points - `"."` (main components) and `"./controls"` (dev tools)
