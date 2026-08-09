import { useSlideContext } from "../../store/context/slide.js";
import { useSlideshowContext } from "../../store/context/slideshow.js";
import { createSectionContext } from "../../store/index.js";
import { getSlidePositionInSection } from "../../utils/section.js";
import { injectStyles } from "../../utils/styles.js";
import totalSlidesCss from "./total-slides.css?raw";

injectStyles(totalSlidesCss, "total-slides");

export class TotalSlides extends HTMLElement {
  private _unsubscribe?: () => void;

  connectedCallback() {
    void Promise.all([
      customElements.whenDefined("ds-slideshow"),
      customElements.whenDefined("ds-slide"),
    ]).then(() => {
      if (!this.isConnected) return;
      const slideCtx = useSlideContext(this);
      if (!slideCtx) return;
      const slideIndex = slideCtx.get().index;
      const withinAttr = this.getAttribute("data-within");
      const within = withinAttr ? parseInt(withinAttr, 10) : undefined;

      if (within === undefined) {
        const slideshowCtx = useSlideshowContext(this);
        this.textContent = String(slideshowCtx.get().numSlides);
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
        this.textContent = pos ? String(pos.total) : "?";
      });
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }
}

customElements.define("ds-total-slides", TotalSlides);
