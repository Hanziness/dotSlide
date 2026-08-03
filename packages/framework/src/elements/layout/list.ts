import { injectStyles } from "../../utils/styles.js";

const listCss = `ds-list {
  display: block;
  list-style: none;
  padding-left: 0;
  margin: 0;
}

ds-list[data-mode="ordered"] {
  counter-reset: ds-list calc(var(--ds-list-start, 1) - 1);
}`;
injectStyles(listCss, "list");

export class DsList extends HTMLElement {
  // Empty CE — just a container with CSS
}
customElements.define("ds-list", DsList);
