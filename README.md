# dotSlide

dotSlide is a modern presentation framework built with Web Components.
Create fast, portable presentations with a single HTML file — no build step required.

Focus on content, not configuration.

## ✨ Why dotSlide

- **(Almost) zero dependencies** — Vanilla custom elements, no framework lock-in.
- **Single-file presentations** — Just add a `<script>` tag, it provides minimal building blocks for real presentations.
- **AI-friendly** — Perfect for LLM-generated presentations. No need to re-architect slideshow controls anymore.
- **Portable** — Works anywhere HTML works.
- **Type-safe** — Full TypeScript support with DOM type augmentations.

## 🧩 What you get

### 🎬 Core presentation

- `<ds-slideshow>` — Root container for the presentation.
- `<ds-slide>` — Individual slide.
- `<ds-step>` — Progressive disclosure within a slide.
- `<ds-section>` — Groups slides into sections.
- `<ds-counter>` — Numbered counter (figures, tables).
- `<ds-reference>` — Reference to a counter.
- `<ds-image>` — Image with loading state.
- `<ds-video>` — Video with slide-aware playback.
- `<ds-overlay>` — Positioning container.
- `<ds-slide-template>` — Reusable slide layout with named slots.
- `<ds-slot>` — Content placeholder inside templates.

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Presentation</title>
</head>
<body>
  <ds-slideshow data-slideshow-width="1920" data-slideshow-height="1080">
    <ds-slide>
      <ds-image src="/cover.png" alt="Cover image"></ds-image>
    </ds-slide>
  </ds-slideshow>

  <script type="module" src="https://unpkg.com/@dotslide/framework/dist/index.js"></script>
</body>
</html>
```

### 📐 Layout helpers

- `<ds-flex>` — Flexbox container.
- `<ds-item>` — Flex item.
- `<ds-list>` — List container.
- `<ds-list-item>` — List item.

```html
<ds-flex gap="2" mode="row">
  <ds-item>Left</ds-item>
  <ds-item>Right</ds-item>
</ds-flex>

<ds-list data-mode="unordered">
  <ds-list-item>One</ds-list-item>
  <ds-list-item>Two</ds-list-item>
</ds-list>
```

### 📊 Live widgets

- `<ds-current-section>` — Shows the section the deck is currently in.
- `<ds-current-slide>` — Shows the active slide number.
- `<ds-progress>` — Displays presentation progress.
- `<ds-total-slides>` — Reports the number of slides in the deck.

```html
<ds-progress data-display="bar"></ds-progress>
<p>Slide <ds-current-slide></ds-current-slide> of <ds-total-slides></ds-total-slides></p>
```

### 🧱 Slide templates

Define reusable layouts once, apply them to any slide.

```html
<ds-slide-template name="title-content">
  <h2><ds-slot name="title"></ds-slot></h2>
  <div><ds-slot /></div>
</ds-slide-template>

<ds-slide template="title-content" ds-slot-title="Welcome">
  <p>This is the body content.</p>
</ds-slide>
```

## 🚀 Usage

### Single HTML File

The simplest way to get started:

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
      <h1>Hello, dotSlide</h1>
      <p>A simple deck built with semantic components.</p>
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
<script type="module">
  import '@dotslide/framework';
</script>

<ds-slideshow data-slideshow-width="1920" data-slideshow-height="1080">
  <ds-slide>
    <h1>Hello, dotSlide</h1>
  </ds-slide>
</ds-slideshow>
```

Or use the `example` app in this repo as a starting point.

### 📦 Tree Shaking

Import only what you need for smaller bundles:

```html
<script type="module">
  import '@dotslide/framework/core';
  import '@dotslide/framework/controls/keyboard-handler';
  import '@dotslide/framework/widgets/progress';
</script>
```

The `core` bundle includes structural elements (slideshow, slide, step, section, slide-template). Import individual components from `@dotslide/framework/controls/*`, `@dotslide/framework/layout/*`, `@dotslide/framework/media/*`, `@dotslide/framework/overlay/*`, or `@dotslide/framework/widgets/*`.

## 💬 Found it useful?

If you like this project, consider [**☕ buying a coffee**](https://buymeacoffee.com/imreg).
