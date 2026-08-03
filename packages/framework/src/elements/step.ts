import { injectStyles } from "../utils/styles"

const css = `@layer dotslide {
  ds-step {
    display: contents;
  }

  ds-step:not(.active) {
    display: none;
  }
}`

injectStyles(css, "step")

export class Step extends HTMLElement {
  connectedCallback() {
  }

  /** First step where this content is visible (inclusive, 1-based) */
  get from(): number | undefined {
    const val = this.dataset.from
    return val ? parseInt(val, 10) : undefined
  }

  /** Last step where this content is visible (inclusive, 1-based) */
  get to(): number | undefined {
    const val = this.dataset.to
    return val ? parseInt(val, 10) : undefined
  }
}

customElements.define("ds-step", Step)
