import { injectStyles } from "../utils/styles";

const css = `@layer dotslide {
  ds-slide-template {
    display: none;
  }

  ds-slot {
    display: contents;
  }
}`;

injectStyles(css, "slide-template");

/** Registry of named slide templates keyed by their `name` attribute. */
const templates = new Map<string, HTMLTemplateElement>();

/**
 * Apply a named template to a host element. Clones the template's content
 * and distributes the host's children into `<ds-slot>` markers by matching
 * `slot="name"` attributes — mirroring native Shadow DOM slot distribution
 * (including fallback content) without requiring a shadow root.
 *
 * Slot content can come from two sources (child elements take precedence):
 * - `slot="name"` attribute on child elements (rich content)
 * - `ds-slot-name="text"` attribute on the host (text shorthand)
 *
 * @returns `true` if the template was found and applied.
 */
export function applyTemplate(host: HTMLElement, name: string): boolean {
  const template = templates.get(name);
  if (!template) return false;

  const fragment = template.content.cloneNode(true) as DocumentFragment;

  // Collect text content from ds-slot-* attributes (text shorthand)
  const attrSlots = new Map<string, Text>();
  for (const attr of host.attributes) {
    if (attr.name.startsWith("ds-slot-")) {
      const slotName = attr.name.slice("ds-slot-".length);
      if (slotName)
        attrSlots.set(slotName, document.createTextNode(attr.value));
    }
  }

  // Partition host children by slot name (child elements take precedence)
  const namedSlots = new Map<string, Node[]>();
  const unnamed: Node[] = [];
  for (const child of Array.from(host.childNodes)) {
    const slotName =
      child instanceof Element ? child.getAttribute("slot") : null;
    if (slotName) {
      let bucket = namedSlots.get(slotName);
      if (!bucket) {
        bucket = [];
        namedSlots.set(slotName, bucket);
      }
      bucket.push(child);
    } else {
      unnamed.push(child);
    }
  }

  // Replace each <ds-slot> marker with its distributed children
  for (const slot of fragment.querySelectorAll("ds-slot")) {
    const slotName = slot.getAttribute("name") ?? "";
    // Child elements win; attribute text fills in when no child claimed the slot
    const childNodes = slotName ? (namedSlots.get(slotName) ?? []) : unnamed;
    const attrText = slotName ? attrSlots.get(slotName) : undefined;
    const nodes =
      childNodes.length > 0 ? childNodes : attrText ? [attrText] : [];
    if (nodes.length > 0) {
      for (const node of nodes) slot.parentNode?.insertBefore(node, slot);
    } else {
      // Fallback: keep the slot's own children (native <slot> behavior)
      while (slot.firstChild) {
        slot.parentNode?.insertBefore(slot.firstChild, slot);
      }
    }
    slot.remove();
  }

  host.appendChild(fragment);
  return true;
}

/**
 * Custom element `<ds-slide-template>` that registers a named slide template.
 *
 * Define templates with `<ds-slot>` markers; apply them with
 * `<ds-slide template="name">`. The template's children are moved into an
 * inert `<template>` element for efficient cloning.
 *
 * Templates must appear before the slides that reference them in DOM order
 * so they register before the slide's `connectedCallback` runs.
 */
export class SlideTemplate extends HTMLElement {
  connectedCallback(): void {
    const name = this.getAttribute("name");
    if (!name) return;
    const template = document.createElement("template");
    while (this.firstChild) template.content.appendChild(this.firstChild);
    templates.set(name, template);
  }
}

customElements.define("ds-slide-template", SlideTemplate);
