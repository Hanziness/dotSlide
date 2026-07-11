import { injectStyles } from "../../utils/styles.js";

const itemCss = `ds-item { display: contents; }`;
injectStyles(itemCss, "item");

export class DsItem extends HTMLElement {
  connectedCallback() {
    // Just a wrapper — no special behavior needed.
  }
}
customElements.define("ds-item", DsItem);
