import { useSlideContext } from "../../store/context/slide.js";
import { createSectionContext } from "../../store/index.js";
import { injectStyles } from "../../utils/styles.js";
import currentSectionCss from "./current-section.css?raw";

injectStyles(currentSectionCss, "current-section");

/**
 * Displays information about the section that contains the enclosing slide.
 * Renders a numeric position (e.g. `1.2`) or the section title, optionally
 * prefixed/suffixed and scoped to a single `level`.
 *
 * Must be placed inside a `ds-slide` so it can resolve its position.
 *
 * @tag ds-current-section
 * @attr data-display - Output mode: `numeric` (default) | `text`
 * @attr data-level - Limit output to a single section level (1-based)
 * @attr data-separator - Separator between numeric levels (default `.`)
 * @attr data-prefix - Text prepended to the output
 * @attr data-suffix - Text appended to the output
 */
export class CurrentSection extends HTMLElement {
  private _unsubscribe?: () => void;

  connectedCallback() {
    queueMicrotask(() => {
      const slideCtx = useSlideContext(this);
      if (!slideCtx) return;

      const slideshowRoot = this.closest("ds-slideshow");
      if (!(slideshowRoot instanceof HTMLElement)) return;

      // Get or create the section store (may not exist yet if Section hasn't connected)
      const sectionStore = createSectionContext(slideshowRoot);

      this._unsubscribe = sectionStore.subscribe((ctx) => {
        if (!ctx.initialized) return;
        this._unsubscribe?.();

        const slideIndex = slideCtx.get().index;
        const sectionInfo = ctx.sectionsBySlide[slideIndex];
        if (!sectionInfo) return;

        const display = this.getAttribute("display") ?? "numeric";
        const levelAttr = this.getAttribute("level");
        const level = levelAttr ? parseInt(levelAttr, 10) : undefined;
        const separator = this.getAttribute("separator") ?? ".";
        const prefix = this.getAttribute("prefix") ?? "";
        const suffix = this.getAttribute("suffix") ?? "";

        if (display === "numeric") {
          this.textContent =
            prefix +
            (level !== undefined
              ? String(sectionInfo.levels[level - 1] ?? "")
              : sectionInfo.levels.join(separator)) +
            suffix;
        } else {
          this.textContent =
            prefix +
            (level !== undefined
              ? (sectionInfo.titles[level] ?? "")
              : (sectionInfo.title ?? "")) +
            suffix;
        }
      });
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }
}

if (!customElements.get("ds-current-section")) {
  customElements.define("ds-current-section", CurrentSection);
}
