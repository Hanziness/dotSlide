# dotSlide

dotSlide is a modern presentation framework built with vanilla custom elements. Create fast, portable presentations with a single HTML file — no build step required.

Focus on content, not configuration.

## ✨ Why dotSlide

- **(Almost) zero dependencies** — Vanilla custom elements, no framework lock-in
- **Single-file presentations** — Just add a `<script>` tag
- **AI-friendly** — Perfect for LLM-generated presentations
- **Portable** — Works anywhere HTML works
- **Type-safe** — Full TypeScript support with DOM type augmentations

## 🚀 Quick Start

### Single HTML File

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Presentation</title>
  <style>
    body { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <ds-slideshow data-slideshow-width="1920" data-slideshow-height="1080">
    <ds-keyboard-handler></ds-keyboard-handler>
    <ds-slide-controls></ds-slide-controls>
    
    <ds-slide>
      <h1>Hello, dotSlide!</h1>
    </ds-slide>
    
    <ds-slide>
      <h2>Second slide</h2>
    </ds-slide>
  </ds-slideshow>
  
  <script type="module" src="https://unpkg.com/@dotslide/framework/dist/index.js"></script>
</body>
</html>
```

### With npm

```bash
npm install @dotslide/framework
```

```html
<script>
  import '@dotslide/framework';
</script>

<ds-slideshow data-slideshow-width="1920" data-slideshow-height="1080">
  <ds-slide>
    <h1>Hello, dotSlide!</h1>
  </ds-slide>
</ds-slideshow>
```

## 🧩 Components

### Core

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `<ds-slideshow>` | Root container for the presentation | `data-slideshow-width`, `data-slideshow-height` |
| `<ds-slide>` | Individual slide | `template` |
| `<ds-step>` | Progressive disclosure within a slide | `data-from`, `data-to` |
| `<ds-section>` | Groups slides into sections | `level`, `title` |
| `<ds-slide-template>` | Reusable slide layout with named slots | `name` |
| `<ds-slot>` | Content placeholder inside a template | `name` |

### Controls

| Element | Description |
|---------|-------------|
| `<ds-keyboard-handler>` | Enables arrow key navigation |
| `<ds-slide-controls>` | On-screen prev/next buttons |
| `<ds-button>` | Navigation button (used internally) |
| `<ds-overlay>` | Positioning container (used internally) |

### Widgets

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `<ds-progress>` | Shows presentation progress | `data-display` (bar/fraction/percentage), `data-within` |
| `<ds-current-slide>` | Current slide number | `data-within` |
| `<ds-total-slides>` | Total slide count | `data-within` |
| `<ds-current-section>` | Current section info | `data-display` (numeric/text), `data-level` |

### Layout

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `<ds-flex>` | Flexbox container | `gap`, `mode` (row/column), `justify`, `align` |
| `<ds-item>` | Flex item | — |
| `<ds-list>` | List container | `data-mode` (ordered/unordered), `style="--ds-list-start: N"` |
| `<ds-list-item>` | List item | — |

### Media

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `<ds-image>` | Image with loading state | Standard `<img>` attributes |
| `<ds-video>` | Video with slide-aware playback | Standard `<video>` attributes |
| `<ds-counter>` | Numbered counter (figures, tables) | `data-type`, `data-id` |
| `<ds-reference>` | Reference to a counter | `data-id` |

## 📖 Examples

### Progressive Disclosure

Gradually reveal elements on slides to direct attention.

```html
<ds-slide>
  <h2>Key Points</h2>
  <ds-step data-from="1"><p>First point</p></ds-step>
  <ds-step data-from="2"><p>Second point</p></ds-step>
  <ds-step data-from="3"><p>Third point</p></ds-step>
</ds-slide>
```

### Sections

Divide presentations into parts, chapters, or sections.

```html
<!-- ds-section doesn't create a slide, so you can customize what to show -->
<ds-section level="1" title="Introduction" />
<ds-slide><h1>Chapter 1</h1></ds-slide>
<ds-slide><p>Content</p></ds-slide>

<ds-section level="1" title="Conclusion" />
<ds-slide><h1>Chapter 2</h1></ds-slide>
```

### Layout

Pre-made components to help arrange content on slides.

```html
<ds-slide>
  <ds-flex gap="2" mode="row">
    <ds-item>Left column</ds-item>
    <ds-item>Right column</ds-item>
  </ds-flex>
</ds-slide>
```

### Widgets

Helper objects that read dynamic data from the presentation. Useful for showing progress.

```html
<ds-slide>
  <p>Slide <ds-current-slide></ds-current-slide> of <ds-total-slides></ds-total-slides></p>
  <ds-progress data-display="bar"></ds-progress>
  <p>Section: <ds-current-section data-display="text"></ds-current-section></p>
</ds-slide>
```

### Counters and References

Create custom counters and refer to them deterministically from other slides.

```html
<ds-slide>
  <p>See Figure <ds-counter data-type="figure" data-id="fig1"></ds-counter></p>
  <p>Later: As shown in Figure <ds-reference data-id="fig1"></ds-reference>...</p>
</ds-slide>
```

### Slide Templates

Define reusable layouts with `<ds-slide-template>` and `<ds-slot>`, then apply them to slides with the `template` attribute.

Templates must appear before the slides that reference them in DOM order.

```html
<ds-slide-template name="main">
  <div class="slide-header">
    <h2><ds-slot name="title"></ds-slot></h2>
  </div>
  <div class="slide-body">
    <ds-slot />
  </div>
</ds-slide-template>

<!-- Text shorthand via ds-slot-* attributes -->
<ds-slide template="main" ds-slot-title="Welcome">
  <p>Body content goes into the unnamed slot.</p>
</ds-slide>

<!-- Rich content via slot attribute on children -->
<ds-slide template="main">
  <span slot="title">Custom <em>rich</em> title</span>
  <p>Body content goes into the unnamed slot.</p>
</ds-slide>
```

## 🎨 Styling

dotSlide uses CSS custom properties for theming:

```css
ds-slideshow {
  --ds-font-content: system-ui, sans-serif;
  --ds-slide-bg: white;
  --ds-control-bg: white;
  --ds-control-radius: 9999px;
}
```

All styles are scoped to the `@layer dotslide` layer for easy customization.

## 🔧 TypeScript

Full type support with DOM augmentations:

```typescript
import '@dotslide/framework';

// TypeScript knows about custom elements
const slideshow = document.querySelector('ds-slideshow');
// Type: Slideshow | null
```

HTML custom data included for editor autocomplete in VS Code and other editors.

## 📦 Tree Shaking

Import only what you need for smaller bundle sizes. You can still do the following:

```js
// include all components
import "@dotslide/framework";

// include only what's necessary
import { Slideshow, Slide } from "@dotslide/framework";
```

### Core Bundle

The `core` entry includes all necessary structural elements (slideshow, slide, step, section, slide-template):

```javascript
import '@dotslide/framework/core';

// Now you can use <ds-slideshow>, <ds-slide>, <ds-step>, <ds-section>, <ds-slide-template>
```

### Individual Components

Import specific elements separately:

```javascript
import '@dotslide/framework/slideshow';
import '@dotslide/framework/slide';
import '@dotslide/framework/widgets/progress';
```

### By Category

Group imports by component type:

```javascript
import '@dotslide/framework/core';
import '@dotslide/framework/controls/keyboard-handler';
import '@dotslide/framework/controls/slide-controls';
import '@dotslide/framework/widgets/progress';
import '@dotslide/framework/widgets/current-slide';
import '@dotslide/framework/widgets/total-slides';
```

Available categories:
- `controls/*` — button, keyboard-handler, overlay, slide-controls
- `layout/*` — flex, item, list, list-item
- `media/*` — counter, image, reference, video
- `overlay/*` — loader
- `widgets/*` — current-section, current-slide, progress, total-slides

## 🛠 Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Watch mode
bun run dev

# Run tests
bun test/serve.sh
# Open http://localhost:8080/test/
```

## 📝 Migration from Astro

If you were using the Astro components:

**Before (Astro):**
```astro
---
import { Slideshow, Slide } from "@dotslide/framework";
---

<Slideshow width={1920} height={1080}>
  <Slide>Content</Slide>
</Slideshow>
```

**After (Custom Elements):**
```html
<ds-slideshow data-slideshow-width="1920" data-slideshow-height="1080">
  <ds-slide>Content</ds-slide>
</ds-slideshow>

<script>
  // Register custom elements on the client side
  import "@dotslide/framework";
</script>
```

The functionality is identical — just use HTML tags instead of Astro components. Make sure to only import the package on the client side.

## 💬 Found it useful?

If you like this project, consider [**☕ buying a coffee**](https://buymeacoffee.com/imreg).
