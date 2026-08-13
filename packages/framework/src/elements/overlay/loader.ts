import { withSlideshowContext } from "../../store/context/slideshow.js";
import { RESOURCE_READY } from "../../utils/events.js";
import type { ResourceRegistrationResult } from "../../utils/resource.js";
import { injectStyles } from "../../utils/styles.js";

import loaderCss from "./loader.css?raw";

injectStyles(loaderCss, "loader");

export class Loader extends HTMLElement {
  num_registered: number = 0;
  num_success: number = 0;
  num_failed: number = 0;
  private store_unsubscribe: (() => void) | undefined = undefined;

  private _updateProgressBar = (progress?: number) => {
    const bar = this.querySelector("div.bar-inner") as HTMLDivElement;
    if (!bar) return;
    bar.style.width = `${(progress ?? (this.num_success / (this.num_registered || 1))) * 100}%`;
  };

  private _onResourceReady = (e: Event) => {
    const result = e as CustomEvent<ResourceRegistrationResult>;
    if (result.detail.success) {
      this.num_success += 1;
    } else {
      this.num_failed += 1;
    }
    this._updateProgressBar();
  };

  connectedCallback() {
    // Set up template if not already present
    if (!this.querySelector(".logo-text")) {
      this.innerHTML = `
        <div class="logo-text">dotSlide</div>
        <div class="progress-track">
          <div class="bar-inner"></div>
        </div>
      `;
    }

    withSlideshowContext(this, (ctx) => {
      this._updateProgressBar(0);

      if (ctx.get().phase === "ready") {
        this._updateProgressBar(1);
        setTimeout(() => {
          this.setAttribute("state", "finished");
        }, this.getAttribute("data-debug") === "true" ? 0 : 300);
        return;
      }

      this.closest("ds-slideshow")?.addEventListener(RESOURCE_READY, this._onResourceReady);

      this.store_unsubscribe = ctx.subscribe((store) => {
        if (store.phase === "loading") {
          this.setAttribute("state", "loading");
          this._updateProgressBar();
        } else if (store.phase === "registering") {
          this.num_registered = Math.max(this.num_registered, Object.keys(store.pending).length);
        } else if (store.phase === "ready") {
          this._updateProgressBar(1);
          setTimeout(() => {
            this.setAttribute("state", "finished");
            this.store_unsubscribe?.();
          }, this.getAttribute("data-debug") === "true" ? 0 : 700);
        }
      });
    });
  }

  disconnectedCallback() {
    this.closest("ds-slideshow")?.removeEventListener(RESOURCE_READY, this._onResourceReady);
    this.store_unsubscribe?.();
  }
}

if (!customElements.get("ds-loader")) {
  customElements.define("ds-loader", Loader);
}
