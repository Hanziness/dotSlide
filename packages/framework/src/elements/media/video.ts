import { injectStyles } from "../../utils/styles.js";

import videoCss from "./video.css?raw";

injectStyles(videoCss, "video");

export class DsVideo extends HTMLElement {
  private video: HTMLVideoElement | null = null;
  private observer: MutationObserver | null = null;
  private slideElement: HTMLElement | null = null;

  connectedCallback() {
    this.video = this.querySelector("video");

    if (!this.video) {
      console.warn("ds-video: no video element found");
      return;
    }

    this.slideElement = this.closest("ds-slide");

    if (!this.slideElement) {
      console.warn("ds-video: not inside a ds-slide element");
      return;
    }

    this._syncPlayback();

    this.observer = new MutationObserver(() => {
      this._syncPlayback();
    });

    this.observer.observe(this.slideElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private _syncPlayback() {
    if (!this.video || !this.slideElement) return;

    const isActive = this.slideElement.classList.contains("active");

    if (isActive) {
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.fastSeek(0);
      this.video.play().catch(() => {
        // Autoplay was prevented - ignore
      });
    } else {
      this.video.pause();
    }
  }
}
if (!customElements.get("ds-video")) {
  customElements.define("ds-video", DsVideo);
}
