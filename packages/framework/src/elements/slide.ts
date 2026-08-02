import { createSlideContext } from "../store/context/slide";
import { logger } from "../utils";
import { injectStyles } from "../utils/styles";

const css = `@layer dotslide {
  ds-slide {
    position: relative;
    width: calc(var(--slide-width) * var(--slide-scale));
    height: calc(var(--slide-height) * var(--slide-scale));
    flex-shrink: 0;
    overflow: hidden;
  }

  ds-slide:not(.active) {
    display: none;
  }

  ds-slide > div.slide-container {
    width: var(--slide-width);
    height: var(--slide-height);
    scale: var(--slide-scale);
    transform-origin: 0 0;
  }
}`;

injectStyles(css, "slide");

export class Slide extends HTMLElement {
  connectedCallback() {

    queueMicrotask(() => {
      const slideshow = this.closest("ds-slideshow");
      if (!slideshow) {
        logger.warn("Slide is not rendered inside a ds-slideshow");
        return;
      }

      const slides = Array.from(
        slideshow.querySelectorAll<HTMLElement>("ds-slide"),
      );
      const slideIndex = slides.indexOf(this);

      if (slideIndex === -1) {
        logger.warn("Slide could not determine its index within the slideshow");
        return;
      }

      this.setAttribute("data-slide-index", slideIndex.toString());
      createSlideContext(this, { index: slideIndex });
    });
  }
}

customElements.define("ds-slide", Slide);
