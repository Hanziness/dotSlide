import { withSlideshowContext } from "../../store/context/slideshow.js";
import { RESOURCE_READY } from "../../utils/events.js";
import type { ResourceRegistrationResult } from "../../utils/resource.js";
import { injectStyles } from "../../utils/styles.js";

const loaderCss = `ds-loader {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  background-color: var(--ds-loader-bg, black);
  color: var(--ds-loader-fg, white);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

ds-loader[state=loading] {
  opacity: 100%;
}

ds-loader[state=finished] {
  display: none;
}

ds-loader .progress-track {
  width: 80%;
  height: 0.5rem;
  background-color: var(--ds-loader-track, rgb(255 255 255 / 0.2));
  border-radius: var(--ds-radius, 9999px);
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

ds-loader .bar-inner {
  height: 100%;
  background-color: var(--ds-loader-bar, white);
  border-radius: var(--ds-radius, 9999px);
  transition: width 0.2s;
}

@keyframes pulse {
  0% { opacity: 70%; }
  50% { opacity: 100%; }
  100% { opacity: 70%; }
}

.logo-text {
  font-size: 3em;
  font-weight: 900;
  animation: pulse 2s ease-in-out infinite;
}`;

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

customElements.define("ds-loader", Loader);
