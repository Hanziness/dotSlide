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

export class Overlay extends HTMLElement {
  connectedCallback() {
    const location = this.getAttribute("data-location") ?? "bottom";
    const alignment = this.getAttribute("data-alignment") ?? "left";
    const padding = this.getAttribute("data-padding") !== null;

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
