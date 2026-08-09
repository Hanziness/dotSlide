import { withSlideshowContext } from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

import slideControlsCss from "./slide-controls.css?raw";

injectStyles(slideControlsCss, "slide-controls");

export class SlideControls extends HTMLElement {
  private _hideTimeout?: number;
  private _slideshowRoot?: HTMLElement;
  private _onMouseMove?: () => void;
  private _onMouseLeave?: () => void;
  private _unsubscribeContext?: () => void;

  private _show = () => {
    this.setAttribute("data-visible", "");
    if (this._hideTimeout) window.clearTimeout(this._hideTimeout);
    this._hideTimeout = window.setTimeout(this._hide, 2000);
  };

  private _hide = () => {
    this.removeAttribute("data-visible");
    if (this._hideTimeout) {
      window.clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }
  };

  connectedCallback() {
    if (!this.querySelector("ds-overlay")) {
      this.innerHTML = `
        <ds-overlay data-location="bottom">
          <div class="controls-left">
            <ds-button data-action="prev">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </ds-button>
            <ds-button data-action="next">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </ds-button>
          </div>
          <div class="slide-number"></div>
        </ds-overlay>
      `;
    }

    // Hover-to-reveal on desktop
    const slideshowRoot = this.closest("ds-slideshow");
    if (slideshowRoot instanceof HTMLElement) {
      this._slideshowRoot = slideshowRoot;

      if (window.matchMedia("(hover: hover)").matches) {
        this._onMouseMove = this._show;
        this._onMouseLeave = this._hide;

        slideshowRoot.addEventListener("mousemove", this._onMouseMove);
        slideshowRoot.addEventListener("mouseleave", this._onMouseLeave);
      }
    }

    // Slide number rendering
    withSlideshowContext(this, (ctx) => {
      const updateSlideNumber = () => {
        const store = ctx.get();
        const slideNumberEl = this.querySelector(".slide-number");
        if (slideNumberEl) {
          slideNumberEl.textContent = `${store.activeSlide + 1} / ${store.numSlides}`;
        }
      };

      updateSlideNumber();
      this._unsubscribeContext = ctx.subscribe(updateSlideNumber);
    });
  }

  disconnectedCallback() {
    if (this._slideshowRoot) {
      if (this._onMouseMove) {
        this._slideshowRoot.removeEventListener("mousemove", this._onMouseMove);
      }
      if (this._onMouseLeave) {
        this._slideshowRoot.removeEventListener("mouseleave", this._onMouseLeave);
      }
    }

    if (this._hideTimeout) {
      window.clearTimeout(this._hideTimeout);
    }

    if (this._unsubscribeContext) {
      this._unsubscribeContext();
    }
  }
}

customElements.define("ds-slide-controls", SlideControls);
