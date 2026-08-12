import { injectStyles } from "../../utils/styles.js";

import listItemCss from "./list-item.css?raw";

injectStyles(listItemCss, "list-item");

export class DsListItem extends HTMLElement {
  // Empty CE — styling via CSS pseudo-elements
}
if (!customElements.get("ds-list-item")) {
  customElements.define("ds-list-item", DsListItem);
}
