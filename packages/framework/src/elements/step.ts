import { injectStyles } from "../utils/styles";
import stepCss from "./step.css?raw";

injectStyles(stepCss, "step");

export class Step extends HTMLElement {
  connectedCallback() {}

  /** First step where this content is visible (inclusive, 1-based) */
  get from(): number | undefined {
    const val = this.dataset.from;
    return val ? parseInt(val, 10) : undefined;
  }

  /** Last step where this content is visible (inclusive, 1-based) */
  get to(): number | undefined {
    const val = this.dataset.to;
    return val ? parseInt(val, 10) : undefined;
  }
}

customElements.define("ds-step", Step);
