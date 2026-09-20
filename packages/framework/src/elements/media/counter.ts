import {
  type CounterInfo,
  type SlideshowStore,
  withSlideshowContext,
} from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

import counterCss from "./counter.css?raw";

injectStyles(counterCss, "counter");

/**
 * Numbered counter for figures, tables, equations, etc. Each counter is
 * scoped by `data-type` and assigned a sequential value as instances are
 * registered. `data-id` lets other slides refer back via `ds-reference`.
 *
 * Requires a `ds-slideshow` ancestor.
 *
 * @tag ds-counter
 * @attr data-type - Counter category (e.g. `figure`, `table`); required
 * @attr data-id - Optional stable id used by `ds-reference` to look up this counter
 */
export class DsCounter extends HTMLElement {
  private valueElement: HTMLElement | null = null;

  connectedCallback() {
    // Set up template if not present
    if (!this.querySelector(".value")) {
      this.innerHTML = '<span class="value"></span>';
    }

    this.valueElement = this.querySelector(".value");
    const type = this.getAttribute("type");
    const ref = this.getAttribute("ref") ?? undefined;

    if (!type) {
      console.warn("ds-counter: missing type attribute");
      return;
    }

    withSlideshowContext(this, (ctx) => {
      this._registerCounter(ctx, type, ref);
    });
  }

  disconnectedCallback() {
    // No cleanup needed - counters are immutable once registered
  }

  private _registerCounter(
    slideshowCtx: SlideshowStore,
    type: string,
    ref: string | undefined,
  ) {
    const ctx = slideshowCtx.get();
    const instances = ctx.counters[type] ?? [];
    const newValue = instances.length + 1;

    const counterInfo: CounterInfo = { value: newValue };
    if (ref) {
      counterInfo.id = ref;
    }

    slideshowCtx.setKey("counters", {
      ...ctx.counters,
      [type]: [...instances, counterInfo],
    });

    if (this.valueElement) {
      this.valueElement.textContent = String(newValue);
    }
  }
}
if (!customElements.get("ds-counter")) {
  customElements.define("ds-counter", DsCounter);
}
