import { injectStyles } from "../../utils/styles.js";

const overlayCss = `
ds-overlay {
  position: absolute;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
ds-overlay.padded { padding: var(--ds-overlay-padding, 1rem); }
ds-overlay.top { top: 0; }
ds-overlay.bottom { bottom: 0; }
ds-overlay.vcenter { height: 100%; align-items: center; }
ds-overlay.left { left: 0; }
ds-overlay.hcenter { width: 100%; justify-content: center; }
ds-overlay.right { right: 0; }
`;

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

customElements.define("ds-overlay", Overlay);
