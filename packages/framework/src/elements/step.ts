import { injectStyles } from "../utils/styles";
import stepCss from "./step.css?raw";

injectStyles(stepCss, "step");

/**
 * Progressive disclosure wrapper inside a slide. Visible only while the
 * current slide step falls within the `[data-from, data-to]` range.
 *
 * Steps are 1-based; a step with `data-from="2"` first appears on step 2.
 *
 * @tag ds-step
 * @attr data-from - First step where content is visible (inclusive, 1-based)
 * @attr data-to - Last step where content is visible (inclusive, 1-based)
 */
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

if (!customElements.get("ds-step")) {
  customElements.define("ds-step", Step);
}
