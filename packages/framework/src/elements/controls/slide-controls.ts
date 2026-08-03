import { injectStyles } from "../../utils/styles.js";

const slideControlsCss = `
/* no extra CSS - uses ds-overlay and ds-button styles */
`;

injectStyles(slideControlsCss, "slide-controls");

export class SlideControls extends HTMLElement {
  connectedCallback() {
    if (!this.querySelector("ds-overlay")) {
      this.innerHTML = `
        <ds-overlay data-location="bottom" data-alignment="left" data-padding>
          <ds-button data-action="prev">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </ds-button>
          <ds-button data-action="next">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </ds-button>
        </ds-overlay>
      `;
    }
  }
}

customElements.define("ds-slide-controls", SlideControls);
