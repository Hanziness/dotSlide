# DotSlide

DotSlide is a modern presentation framework for Astro.
It helps you build fast, portable decks from semantic components instead of custom slide code by providing ready-made components.


Focus on the contents, not how to prompt out the right layout and key bindings.

## ✨ Why DotSlide

- Minimal building blocks for real presentations.
- Export to a static website using the power of Astro.
- Built to grow into more ready-made features, like a controller app.

## 🧩 What you get

### 🎬 Core presentation

- `Root` — wraps a presentation and provides the main slideshow context.
- `Slideshow` — defines the slide deck canvas and shared presentation settings.
- `Slide` — renders one slide of content.
- `Section` — helps group slides into chapters and sections.
- `Step` — reveals content within slides in stages.
- `Counter` — tracks slide-adjacent values such as counts or labels. Use for figures, tables etc.
- `Reference` — links to a counter in the deck.
- `Image` — adds responsive images with presentation-friendly defaults.
- `Video` — embeds video content in a slide.
- `Overlay` — positions content on top of a slide.

```astro
---
import { Root, Slideshow, Slide, Image } from "@dotslide/framework";
---

<Root>
  <Slideshow>
    <Slide>
      <Image src="/cover.png" alt="Cover image" />
    </Slide>
  </Slideshow>
</Root>
```

### 📐 Layout helpers

- `Flex` — lays out items in a row or column.
- `Item` — places one item inside a flex layout.
- `List.Root` — creates a styled list container.
- `List.Item` — renders one item inside a list.

```astro
---
import { Flex, Item, List } from "@dotslide/framework/layout";
---

<Flex>
  <Item>Left</Item>
  <Item>Right</Item>
</Flex>

<List.Root unordered>
  <List.Item>One</List.Item>
  <List.Item>Two</List.Item>
</List.Root>
```

### 📊 Live widgets

- `CurrentSection` — shows the section the deck is currently in.
- `CurrentSlide` — shows the active slide number or label.
- `Progress` — displays presentation progress.
- `TotalSlides` — reports the number of slides in the deck.

```astro
---
import { Progress, TotalSlides } from "@dotslide/framework/widgets";
---

<Progress />
<p><TotalSlides /> slides</p>
```

## 🚀 Usage

Start by importing `@dotslide/framework` in an Astro project:

```astro
---
import { Root, Slideshow, Slide } from "@dotslide/framework";
import "@dotslide/framework/themes/default.css";
---

<Root>
  <Slideshow>
    <Slide>
      <h1>Hello, dotSlide</h1>
      <p>A simple deck built with semantic components.</p>
    </Slide>
  </Slideshow>
</Root>
```

Or use the `example` app in this repo as a starting point.

## 💬 Found it useful?

If you like this project, consider [**☕ buying a coffee**](https://buymeacoffee.com/imreg).
