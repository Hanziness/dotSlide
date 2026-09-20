import { useSlideContext } from "../../store/context/slide.js";
import { createSectionContext } from "../../store/index.js";
import { getSlidePositionInSection } from "../../utils/section.js";
import { injectStyles } from "../../utils/styles.js";
import currentSlideCss from "./current-slide.css?raw";

injectStyles(currentSlideCss, "current-slide");

/**
 * Displays the current slide number. Without `within` shows the
 * global 1-based slide index; with `within` shows the position within
 * the enclosing section of the given level.
 *
 * Must be placed inside a `ds-slide`.
 *
 * @tag ds-current-slide
 * @attr within - Section level to scope the count to (1-based)
 */
export class CurrentSlide extends HTMLElement {
  private _unsubscribe?: () => void;

  connectedCallback() {
    queueMicrotask(() => {
      const slideCtx = useSlideContext(this);
      if (!slideCtx) return;
      const slideIndex = slideCtx.get().index;
      const withinAttr = this.getAttribute("within");
      const within = withinAttr ? parseInt(withinAttr, 10) : undefined;

      if (within === undefined) {
        this.textContent = String(slideIndex + 1);
        return;
      }

      const slideshowRoot = this.closest("ds-slideshow");
      if (!(slideshowRoot instanceof HTMLElement)) return;

      const sectionStore = createSectionContext(slideshowRoot);

      this._unsubscribe = sectionStore.subscribe((ctx) => {
        if (!ctx.initialized) return;
        this._unsubscribe?.();
        const pos = getSlidePositionInSection(
          slideshowRoot,
          slideIndex,
          within,
        );
        this.textContent = pos ? String(pos.position) : "?";
      });
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }
}

if (!customElements.get("ds-current-slide")) {
  customElements.define("ds-current-slide", CurrentSlide);
}
