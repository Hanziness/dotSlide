import { injectStyles } from "../../utils/styles.js";
import { useSlideshowContext } from "../../store/context/slideshow.js";

const buttonCss = `
ds-button { display: contents; }
ds-button button {
  border-radius: var(--ds-control-radius, 9999px);
  background-color: var(--ds-control-bg, white);
  padding: 0.75rem;
  box-shadow: var(--ds-control-shadow, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1));
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
`;

injectStyles(buttonCss, "button");

export class DsButton extends HTMLElement {
  connectedCallback() {
    if (!this.querySelector("button")) {
      const btn = document.createElement("button");
      btn.type = "button";
      while (this.firstChild) btn.appendChild(this.firstChild);
      this.appendChild(btn);
    }

    const action = this.getAttribute("data-action") as
      | "next"
      | "prev"
      | "first"
      | "last"
      | null;
    if (action === null) return;

    const ctx = useSlideshowContext(this);
    const btn = this.querySelector("button")!;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ctx[action]();
    });
  }
}

customElements.define("ds-button", DsButton);
