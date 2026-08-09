import { createSlideContext } from "../store/context/slide";
import { injectStyles } from "../utils/styles";
import { applyTemplate } from "./slide-template";

const css = `@layer dotslide {
  ds-slide {
    position: relative;
    background-color: var(--ds-slide-bg, white);
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
  async connectedCallback() {
    const slideshow = this.closest("ds-slideshow");
    if (!slideshow) {
      console.warn("[dotslide]", "Slide is not rendered inside a ds-slideshow");
      return;
    }

    // Apply template before index calculation so template-introduced
    // ds-step elements are visible when the slideshow builds navigation
    const templateName = this.getAttribute("template");
    if (templateName && (await applyTemplate(this, templateName) !== true)) {
      console.warn(
        "[dotslide]",
        `Slide template "${templateName}" not found — define <ds-slide-template name="${templateName}"> before this slide`,
      );
    }

    const slides = Array.from(
      slideshow.querySelectorAll<HTMLElement>("ds-slide"),
    );
    const slideIndex = slides.indexOf(this);

    if (slideIndex === -1) {
      console.warn(
        "[dotslide]",
        "Slide could not determine its index within the slideshow",
      );
      return;
    }

    this.setAttribute("data-slide-index", slideIndex.toString());
    createSlideContext(this, { index: slideIndex });
  }
}

customElements.define("ds-slide", Slide);
