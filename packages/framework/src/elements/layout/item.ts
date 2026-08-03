import { injectStyles } from "../../utils/styles.js";

const itemCss = `ds-item { display: contents; }`;
injectStyles(itemCss, "item");

export class DsItem extends HTMLElement {}
customElements.define("ds-item", DsItem);
