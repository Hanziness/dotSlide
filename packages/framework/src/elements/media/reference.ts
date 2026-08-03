import {
  type SlideshowStore,
  withSlideshowContext,
} from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

const referenceCss = `ds-reference { display: inline; }`;
injectStyles(referenceCss, "reference");

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

    const id = this.getAttribute("data-id");

    if (!id) {
      console.warn("ds-reference: missing data-id attribute");
      return;
    }

    withSlideshowContext(this, (ctx) => {
      this._unsubscribe = ctx.subscribe(() => {
        this._syncCounter(ctx, id);
      });

      this._syncCounter(ctx, id);
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

  private _syncCounter(slideshowCtx: SlideshowStore, id: string) {
    const counter = Object.values(slideshowCtx.get().counters)
      .flat()
      .find((entry) => entry.id === id);

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
      console.warn(`ds-reference: counter not found for id="${id}"`);
      this._warnedMissingCounter = true;
    }
  }
}
customElements.define("ds-reference", DsReference);
