import { sectionContext } from "../store";
import { buildSectionHierarchy } from "../utils/section";

/**
 * Custom element `<ds-section>` that marks a section boundary in the presentation.
 *
 * Reads `level` and `title` attributes, sets `data-section-level` and
 * `data-section-title` on itself, and triggers `buildSectionHierarchy()` once
 * when the DOM is ready.
 */
class Section extends HTMLElement {
  connectedCallback(): void {
    const level = this.getAttribute("level") ?? "1";
    const title = this.getAttribute("title");

    this.dataset.sectionLevel = level;
    if (title !== null) {
      this.dataset.sectionTitle = title;
    }

    // Build section hierarchy once — uses a flag check to run exactly once
    if (!sectionContext.get().initialized) {
      queueMicrotask(() => {
        if (!sectionContext.get().initialized) {
          buildSectionHierarchy();
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

customElements.define("ds-section", Section);

export { Section };
