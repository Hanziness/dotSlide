import { injectStyles } from "../../utils/styles.js";

import itemCss from "./item.css?raw";

injectStyles(itemCss, "item");

/**
 * Flex item inside a `ds-flex` container. Renders as `display: contents` so it
 * doesn't interfere with flex layout or surrounding markup.
 *
 * @tag ds-item
 */
export class DsItem extends HTMLElement {}
if (!customElements.get("ds-item")) {
  customElements.define("ds-item", DsItem);
}
