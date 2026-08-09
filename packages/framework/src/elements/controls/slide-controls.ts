import { withSlideshowContext } from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

import slideControlsCss from "./slide-controls.css?raw";

injectStyles(slideControlsCss, "slide-controls");

export class SlideControls extends HTMLElement {
  private static readonly HIDE_DELAY_MS = 2000;

  private _hideTimeout?: number;
  private _onMouseEnter?: () => void;
  private _onMouseLeave?: () => void;
  private _unsubscribeContext?: () => void;

  private _show = () => {
    this.setAttribute("data-visible", "");
    if (this._hideTimeout) {
      window.clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }
  };

  private _startHideTimeout = () => {
    if (this._hideTimeout) window.clearTimeout(this._hideTimeout);
    this._hideTimeout = window.setTimeout(() => {
      if (!this.matches(":hover")) {
        this._hide();
      }
    }, SlideControls.HIDE_DELAY_MS);
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
    if (window.matchMedia("(hover: hover)").matches) {
      this._onMouseEnter = this._show;
      this._onMouseLeave = this._startHideTimeout;

      this.addEventListener("mouseenter", this._onMouseEnter);
      this.addEventListener("mouseleave", this._onMouseLeave);
    } else {
      // Touch devices: always visible, no trigger zone needed
      this._show();
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
    if (this._onMouseEnter) {
      this.removeEventListener("mouseenter", this._onMouseEnter);
    }

    if (this._onMouseLeave) {
      this.removeEventListener("mouseleave", this._onMouseLeave);
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
