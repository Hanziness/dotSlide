import { injectStyles } from "../../utils/styles.js";

import itemCss from "./item.css?raw";

injectStyles(itemCss, "item");

export class DsItem extends HTMLElement {}
customElements.define("ds-item", DsItem);
