import { injectStyles } from "../../utils/styles.js";

import listCss from "./list.css?raw";

injectStyles(listCss, "list");

export class DsList extends HTMLElement {
  // Empty CE — just a container with CSS
}
customElements.define("ds-list", DsList);
