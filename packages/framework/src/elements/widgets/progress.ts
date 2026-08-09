import { useSlideContext } from "../../store/context/slide.js";
import { useSlideshowContext } from "../../store/context/slideshow.js";
import { createSectionContext } from "../../store/index.js";
import { getSlidePositionInSection } from "../../utils/section.js";
import { injectStyles } from "../../utils/styles.js";
import progressCss from "./progress.css?raw";

injectStyles(progressCss, "progress");

export class Progress extends HTMLElement {
  private _unsubscribe?: () => void;

  connectedCallback() {
    void Promise.all([
      customElements.whenDefined("ds-slideshow"),
      customElements.whenDefined("ds-slide"),
    ]).then(() => {
      if (!this.isConnected) return;
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
      if (!slideCtx) {
        console.warn(
          "<ds-progress> was place outside of a <ds-slide>. This is not supported.",
        );
        return;
      }
      const slideIndex = slideCtx.get().index;

      const slideshowRoot = this.closest("ds-slideshow");
      if (!(slideshowRoot instanceof HTMLElement)) return;

      const sectionStore = createSectionContext(slideshowRoot);

      this._unsubscribe = sectionStore.subscribe((ctx) => {
        if (!ctx.initialized) return;
        this._unsubscribe?.();

        const withinAttr = this.getAttribute("data-within");
        const within = withinAttr ? parseInt(withinAttr, 10) : undefined;
        const display = this.getAttribute("data-display") ?? "fraction";

        let position: number;
        let total: number;

        if (within !== undefined) {
          const pos = getSlidePositionInSection(
            slideshowRoot,
            slideIndex,
            within,
          );
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
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }
}

customElements.define("ds-progress", Progress);
