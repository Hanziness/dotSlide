import {
  type SlideshowStore,
  withSlideshowContext,
} from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

import referenceCss from "./reference.css?raw";

injectStyles(referenceCss, "reference");

/**
 * Renders the value of a counter registered with a matching `ref`. Useful
 * for cross-referencing figures and tables across slides.
 *
 * The element renders `prefix + value + suffix` once the referenced counter
 * is found.
 *
 * @tag ds-reference
 * @attr ref - Id of the `ds-counter` to look up
 * @attr prefix - Text prepended to the counter value
 * @attr suffix - Text appended to the counter value
 */
export class DsReference extends HTMLElement {
  static observedAttributes = ["prefix", "suffix"] as const;

  private _unsubscribe?: () => void;
  private _warnedMissingCounter = false;
  private _prefix: string = "";
  private _suffix: string = "";

  connectedCallback() {
    // Set up template if not present
    if (!this.querySelector(".value")) {
      this.innerHTML = '<span class="value"></span>';
    }

    const ref = this.getAttribute("ref");

    if (!ref) {
      console.warn("ds-reference: missing ref attribute");
      return;
    }

    withSlideshowContext(this, (ctx) => {
      this._unsubscribe = ctx.subscribe(() => {
        this._syncCounter(ctx, ref);
      });

      this._syncCounter(ctx, ref);
    });
  }

  attributeChangedCallback(
    name: (typeof DsReference.observedAttributes)[number],
    _oldValue: string,
    newValue: string,
  ) {
    if (name === "prefix") {
      this._prefix = newValue;
    } else if (name === "suffix") {
      this._suffix = newValue;
    }
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }

  private _syncCounter(slideshowCtx: SlideshowStore, ref: string) {
    const counter = Object.values(slideshowCtx.get().counters)
      .flat()
      .find((entry) => entry.id === ref);

    if (counter) {
      const valueElement = this.querySelector<HTMLElement>(".value");
      if (valueElement) {
        valueElement.textContent = `${this._prefix}${String(counter.value)}${this._suffix}`;
      }
      this._unsubscribe?.();
      this._unsubscribe = undefined;
      return;
    }

    if (
      !this._warnedMissingCounter &&
      slideshowCtx.get().phase !== "registering"
    ) {
      console.warn(`ds-reference: counter not found for ref="${ref}"`);
      this._warnedMissingCounter = true;
    }
  }
}
if (!customElements.get("ds-reference")) {
  customElements.define("ds-reference", DsReference);
}
