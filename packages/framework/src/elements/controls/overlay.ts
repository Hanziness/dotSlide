import { injectStyles } from "../../utils/styles.js";

import overlayCss from "./overlay.css?raw";

injectStyles(overlayCss, "overlay");

const LOCATION_MAP: Record<string, string> = {
  top: "top",
  bottom: "bottom",
  center: "vcenter",
};

const ALIGNMENT_MAP: Record<string, string> = {
  left: "left",
  right: "right",
  center: "hcenter",
};

/**
 * Positioning container for floating UI (controls, captions, etc.). Maps
 * `location` and `alignment` attributes to CSS classes that anchor
 * the overlay to a corner of the parent.
 *
 * @tag ds-overlay
 * @attr location - Vertical location: `top` | `bottom` | `center` (default `bottom`)
 * @attr alignment - Horizontal alignment: `left` | `right` | `center` (default `left`)
 * @attr padding - Presence adds padding via `--ds-overlay-padding`
 * @cssprop --ds-overlay-padding - Inner padding when `padding` is present
 */
export class Overlay extends HTMLElement {
  connectedCallback() {
    const location = this.getAttribute("location") ?? "bottom";
    const alignment = this.getAttribute("alignment") ?? "left";
    const padding = this.getAttribute("padding") !== null;

    const locClass = LOCATION_MAP[location];
    if (locClass) this.classList.add(locClass);

    const alignClass = ALIGNMENT_MAP[alignment];
    if (alignClass) this.classList.add(alignClass);

    if (padding) this.classList.add("padded");
  }
}

if (!customElements.get("ds-overlay")) {
  customElements.define("ds-overlay", Overlay);
}
