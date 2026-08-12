import { injectStyles } from "../../utils/styles.js";
import { registerResource } from "../../utils/resource.js";

import imageCss from "./image.css?raw";

injectStyles(imageCss, "image");

export class DsImage extends HTMLElement {
  connectedCallback() {
    const img = this.querySelector("img");
    if (!img) return;

    const handle = registerResource(this);

    if (img.complete) {
      handle.ready();
    } else {
      img.addEventListener("load", () => handle.ready(), { once: true });
      img.addEventListener("error", (e) => handle.error({ ...e, name: "Image loading error" } as Error), { once: true });
    }
  }
}
if (!customElements.get("ds-image")) {
  customElements.define("ds-image", DsImage);
}
