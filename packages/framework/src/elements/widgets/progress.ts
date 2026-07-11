import { injectStyles } from "../../utils/styles.js";
import { sectionContext } from "../../store/index.js";
import { useSlideContext } from "../../store/context/slide.js";
import { useSlideshowContext } from "../../store/context/slideshow.js";
import { getSlidePositionInSection } from "../../utils/section.js";

const css = `ds-progress { display: inline; }
ds-progress .track {
  display: inline-block;
  width: 100%;
  height: 0.4em;
  background: color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 9999px;
}
ds-progress .fill {
  height: 100%;
  background: currentColor;
  border-radius: inherit;
  transition: width 0.2s;
}`;

injectStyles(css, "progress");

export class Progress extends HTMLElement {
  private _unsubscribe?: () => void;

  connectedCallback() {
    const display = this.getAttribute("data-display") ?? "fraction";
    if (display === "bar") {
      if (!this.querySelector(".track")) {
        this.innerHTML = '<div class="track"><div class="fill"></div></div>';
      }
    } else {
      if (!this.querySelector(".text")) {
        this.innerHTML = '<span class="text"></span>';
      }
    }

    const slideCtx = useSlideContext(this);
    if (!slideCtx) return;
    const slideIndex = slideCtx.get().index;

    this._unsubscribe = sectionContext.subscribe((ctx) => {
      if (!ctx.initialized) return;
      this._unsubscribe?.();

      const withinAttr = this.getAttribute("data-within");
      const within = withinAttr ? parseInt(withinAttr, 10) : undefined;
      const display = this.getAttribute("data-display") ?? "fraction";

      let position: number;
      let total: number;

      if (within !== undefined) {
        const pos = getSlidePositionInSection(slideIndex, within);
        if (!pos) return;
        position = pos.position;
        total = pos.total;
      } else {
        const slideshowCtx = useSlideshowContext(this);
        position = slideIndex + 1;
        total = slideshowCtx.get().numSlides;
      }

      if (display === "fraction") {
        const textEl = this.querySelector(".text");
        if (textEl) textEl.textContent = `${position}/${total}`;
      } else if (display === "percentage") {
        const textEl = this.querySelector(".text");
        const pct = total > 0 ? Math.round((position / total) * 100) : 0;
        if (textEl) textEl.textContent = `${pct}%`;
      } else if (display === "bar") {
        const fillEl = this.querySelector<HTMLElement>(".fill");
        const pct = total > 0 ? (position / total) * 100 : 0;
        if (fillEl) fillEl.style.width = `${pct}%`;
      }
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }
}

customElements.define("ds-progress", Progress);
