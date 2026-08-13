import {
  type CounterInfo,
  type SlideshowStore,
  withSlideshowContext,
} from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

import counterCss from "./counter.css?raw";

injectStyles(counterCss, "counter");

export class DsCounter extends HTMLElement {
  private valueElement: HTMLElement | null = null;

  connectedCallback() {
    // Set up template if not present
    if (!this.querySelector(".value")) {
      this.innerHTML = '<span class="value"></span>';
    }

    this.valueElement = this.querySelector(".value");
    const type = this.getAttribute("data-type");
    const id = this.getAttribute("data-id") ?? undefined;

    if (!type) {
      console.warn("ds-counter: missing data-type attribute");
      return;
    }

    withSlideshowContext(this, (ctx) => {
      this._registerCounter(ctx, type, id);
    });
  }

  disconnectedCallback() {
    // No cleanup needed - counters are immutable once registered
  }

  private _registerCounter(
    slideshowCtx: SlideshowStore,
    type: string,
    id: string | undefined,
  ) {
    const ctx = slideshowCtx.get();
    const instances = ctx.counters[type] ?? [];
    const newValue = instances.length + 1;

    const counterInfo: CounterInfo = { value: newValue };
    if (id) {
      counterInfo.id = id;
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
