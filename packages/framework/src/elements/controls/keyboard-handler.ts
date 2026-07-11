import { useSlideshowContext } from "../../store/context/slideshow.js";

type NavigationAction = "next" | "prev" | "first" | "last";

const KEY_MAP: Record<string, NavigationAction> = {
  ArrowRight: "next",
  ArrowDown: "next",
  PageDown: "next",
  ArrowLeft: "prev",
  ArrowUp: "prev",
  PageUp: "prev",
  Home: "first",
  End: "last",
};

export class KeyboardHandler extends HTMLElement {
  private keydownHandler: ((e: KeyboardEvent) => void) | undefined;

  connectedCallback() {
    const ctx = useSlideshowContext(this);
    const root = ctx.get().root;
    this.keydownHandler = (e: KeyboardEvent) => {
      if (
        !root.contains(document.activeElement) &&
        document.activeElement !== document.body
      )
        return;
      const action = KEY_MAP[e.key];
      if (action === undefined) return;
      e.preventDefault();
      ctx[action]();
    };
    document.addEventListener("keydown", this.keydownHandler);
  }

  disconnectedCallback() {
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = undefined;
    }
  }
}

customElements.define("ds-keyboard-handler", KeyboardHandler);
