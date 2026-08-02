import { useSlideContext } from "../../store/context/slide.js";
import { useSectionContext } from "../../store/index.js";
import { injectStyles } from "../../utils/styles.js";

const css = "ds-current-section { display: inline; }";

injectStyles(css, "current-section");

export class CurrentSection extends HTMLElement {
  private _unsubscribe?: () => void;

  connectedCallback() {
    queueMicrotask(() => {
      const slideCtx = useSlideContext(this);
      if (!slideCtx) return;

      const sectionStore = useSectionContext(this);
      if (!sectionStore) return;

      this._unsubscribe = sectionStore.subscribe((ctx) => {
        if (!ctx.initialized) return;
        this._unsubscribe?.();

        const slideIndex = slideCtx.get().index;
        const sectionInfo = ctx.sectionsBySlide[slideIndex];
        if (!sectionInfo) return;

        const display = this.getAttribute("data-display") ?? "numeric";
        const levelAttr = this.getAttribute("data-level");
        const level = levelAttr ? parseInt(levelAttr, 10) : undefined;
        const separator = this.getAttribute("data-separator") ?? ".";
        const prefix = this.getAttribute("data-prefix") ?? "";
        const suffix = this.getAttribute("data-suffix") ?? "";

        if (display === "numeric") {
          this.textContent =
            prefix +
            (level !== undefined
              ? String(sectionInfo.levels[level - 1] ?? "")
              : sectionInfo.levels.join(separator)) +
            suffix;
        } else {
          this.textContent =
            prefix +
            (level !== undefined
              ? (sectionInfo.titles[level] ?? "")
              : (sectionInfo.title ?? "")) +
            suffix;
        }
      });
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }
}

customElements.define("ds-current-section", CurrentSection);
