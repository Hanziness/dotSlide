import { createSectionContext } from "../store";
import { buildSectionHierarchy } from "../utils/section";

/**
 * Marks a section boundary in the presentation. Sections are invisible
 * markers used by `ds-current-section` to display headings and numbering.
 *
 * Place before the slides that belong to the section.
 *
 * @tag ds-section
 * @attr level - Section depth (1-based, defaults to `1`)
 * @attr title - Human-readable section title
 */
class Section extends HTMLElement {
  connectedCallback(): void {
    const level = this.getAttribute("level") ?? "1";
    const title = this.getAttribute("title");

    this.dataset.sectionLevel = level;
    if (title !== null) {
      this.dataset.sectionTitle = title;
    }

    const slideshowRoot = this.closest("ds-slideshow");
    if (!(slideshowRoot instanceof HTMLElement)) return;

    const sectionStore = createSectionContext(slideshowRoot);

    // Build section hierarchy once — uses a flag check to run exactly once
    if (!sectionStore.get().initialized) {
      queueMicrotask(() => {
        if (!sectionStore.get().initialized) {
          buildSectionHierarchy(slideshowRoot);
        }
      });
    }
  }

  static get observedAttributes(): string[] {
    return ["level", "title"];
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    if (name === "level" && newValue !== null) {
      this.dataset.sectionLevel = newValue;
    } else if (name === "title") {
      if (newValue !== null) {
        this.dataset.sectionTitle = newValue;
      } else {
        delete this.dataset.sectionTitle;
      }
    }
  }
}

if (!customElements.get("ds-section")) {
  customElements.define("ds-section", Section);
}

export { Section };
