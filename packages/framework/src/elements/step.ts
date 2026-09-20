import { injectStyles } from "../utils/styles";
import stepCss from "./step.css?raw";

injectStyles(stepCss, "step");

/**
 * Progressive disclosure wrapper inside a slide. Visible only while the
 * current slide step falls within the `[from, to]` range.
 *
 * Steps are 1-based; a step with `from="2"` first appears on step 2.
 *
 * @tag ds-step
 * @attr from - First step where content is visible (inclusive, 1-based)
 * @attr to - Last step where content is visible (inclusive, 1-based)
 */
export class Step extends HTMLElement {
  connectedCallback() {}

  /** First step where this content is visible (inclusive, 1-based) */
  get from(): number | undefined {
    const val = this.getAttribute("from");
    return val ? parseInt(val, 10) : undefined;
  }

  /** Last step where this content is visible (inclusive, 1-based) */
  get to(): number | undefined {
    const val = this.getAttribute("to");
    return val ? parseInt(val, 10) : undefined;
  }
}

if (!customElements.get("ds-step")) {
  customElements.define("ds-step", Step);
}
