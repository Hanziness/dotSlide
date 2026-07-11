import { injectStyles } from "../../utils/styles.js";
import { sectionContext } from "../../store/index.js";
import { useSlideContext } from "../../store/context/slide.js";
import { useSlideshowContext } from "../../store/context/slideshow.js";
import { getSlidePositionInSection } from "../../utils/section.js";

const css = "ds-total-slides { display: inline; }";

injectStyles(css, "total-slides");

export class TotalSlides extends HTMLElement {
  private _unsubscribe?: () => void;

  connectedCallback() {
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

    this._unsubscribe = sectionContext.subscribe((ctx) => {
      if (!ctx.initialized) return;
      this._unsubscribe?.();
      const pos = getSlidePositionInSection(slideIndex, within);
      this.textContent = pos ? String(pos.total) : "?";
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }
}

customElements.define("ds-total-slides", TotalSlides);
