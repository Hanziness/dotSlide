import { injectStyles } from "../../utils/styles.js";

const flexCss = `ds-flex {
  display: flex;
  flex-direction: var(--flex-direction, row);
  justify-content: var(--justify, start);
  align-items: var(--align, center);
  gap: var(--gap, .5rem);
}`;
injectStyles(flexCss, "flex");

export class DsFlex extends HTMLElement {
  static observedAttributes = ["gap", "justify", "align", "mode"] as const;

  attributeChangedCallback(
    name: (typeof DsFlex.observedAttributes)[number],
    _oldValue: string,
    newValue: string,
  ) {
    if (name === "gap") {
      const parsed = Number(newValue);
      this.style.setProperty("--gap", `${Number.isNaN(parsed) ? 0.5 : parsed}rem`);
    } else if (name === "justify") {
      this.style.setProperty("--justify", newValue ?? "start");
    } else if (name === "align") {
      this.style.setProperty("--align", newValue);
    } else if (name === "mode") {
      this.style.setProperty("--flex-direction", newValue);
    }
  }
}
customElements.define("ds-flex", DsFlex);
