import { injectStyles } from "../../utils/styles.js";
import { useSlideshowContext } from "../../store/context/slideshow.js";

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

    const slideshowCtx = useSlideshowContext(this);
    this._unsubscribe = slideshowCtx.subscribe(() => {
      this._syncCounter(slideshowCtx, id);
    });

    this._syncCounter(slideshowCtx, id);
  }

  attributeChangedCallback(name: typeof DsReference.observedAttributes[number], _oldValue: string, newValue: string) {
    if (name === "prefix") {
      this._prefix = newValue;
    } else if (name === "suffix") {
      this._suffix = newValue;
    }
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }

  private _syncCounter(
    slideshowCtx: ReturnType<typeof useSlideshowContext>,
    id: string,
  ) {
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

    if (!this._warnedMissingCounter && slideshowCtx.get().phase !== "registering") {
      console.warn(`ds-reference: counter not found for id="${id}"`);
      this._warnedMissingCounter = true;
    }
  }
}
customElements.define("ds-reference", DsReference);
