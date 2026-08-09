import { withSlideshowContext } from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

import slideControlsCss from "./slide-controls.css?raw";

injectStyles(slideControlsCss, "slide-controls");

export class SlideControls extends HTMLElement {
  private static readonly HIDE_DELAY_MS = 2000;

  private _hideTimeout?: number;
  private _ac?: AbortController;
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
    this._ac = new AbortController();
    const { signal } = this._ac;

    if (!this.querySelector("ds-overlay")) {
      this.innerHTML = `
        <ds-overlay data-location="bottom">
          <ds-button class="fullscreen-btn">
            <svg xmlns="http://www.w3.org/2000/svg" data-icon="enter" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-maximize"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /></svg>
            <svg xmlns="http://www.w3.org/2000/svg" data-icon="exit" hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrows-minimize"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 9l4 0l0 -4" /><path d="M3 3l6 6" /><path d="M5 15l4 0l0 4" /><path d="M3 21l6 -6" /><path d="M19 9l-4 0l0 -4" /><path d="M15 9l6 -6" /><path d="M19 15l-4 0l0 4" /><path d="M15 15l6 6" /></svg>
          </ds-button>
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
      this.addEventListener("mouseenter", this._show, { signal });
      this.addEventListener("mouseleave", this._startHideTimeout, { signal });
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

      // Fullscreen toggle
      const root = ctx.get().root;
      const fullscreenBtn = this.querySelector<HTMLElement>(".fullscreen-btn");
      const enterIcon = this.querySelector('[data-icon="enter"]');
      const exitIcon = this.querySelector('[data-icon="exit"]');

      if (fullscreenBtn) {
        fullscreenBtn.addEventListener(
          "click",
          () => {
            if (document.fullscreenElement === null) {
              root
                .requestFullscreen()
                .catch(() =>
                  console.warn("[dotslide] Fullscreen request denied"),
                );
            } else {
              void document.exitFullscreen();
            }
          },
          { signal },
        );
      }

      if (enterIcon && exitIcon) {
        const updateFullscreenIcons = () => {
          const isFullscreen = document.fullscreenElement !== null;
          enterIcon.toggleAttribute("hidden", isFullscreen);
          exitIcon.toggleAttribute("hidden", !isFullscreen);
        };
        document.addEventListener("fullscreenchange", updateFullscreenIcons, {
          signal,
        });
        updateFullscreenIcons();
      }
    });
  }

  disconnectedCallback() {
    this._ac?.abort();
    if (this._hideTimeout) window.clearTimeout(this._hideTimeout);
    this._unsubscribeContext?.();
  }
}

customElements.define("ds-slide-controls", SlideControls);
