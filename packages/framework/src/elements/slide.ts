import { createSlideContext } from "../store/context/slide";
import { withSlideshowContext } from "../store/context/slideshow";
import { injectStyles } from "../utils/styles";
import slideCss from "./slide.css?raw";
import { applyTemplate } from "./slide-template";

injectStyles(slideCss, "slide");

export class Slide extends HTMLElement {
  connectedCallback() {
    const slideshow = this.closest("ds-slideshow");
    if (!slideshow) {
      console.warn("[dotslide]", "Slide is not rendered inside a ds-slideshow");
      return;
    }

    withSlideshowContext(this, (ctx) => {
      // Apply template before index calculation so template-introduced
      // ds-step elements are visible when the slideshow builds navigation
      const templateName = this.getAttribute("template");
      if (templateName && !applyTemplate(this, templateName, ctx)) {
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
    });
  }
}

customElements.define("ds-slide", Slide);
