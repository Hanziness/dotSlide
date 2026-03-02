/**
 * Renders a laser pointer dot inside the ds-slideshow element.
 *
 * Coordinates are normalized [0, 1] relative to slide dimensions.
 * The dot is positioned using CSS `left`/`top` percentages within
 * the slide's coordinate space, automatically scaling with the
 * --slide-scale CSS variable.
 */
export class LaserOverlay {
  private dot: HTMLElement | null = null;
  private slideshow: HTMLElement | null = null;

  private ensureDot(): HTMLElement {
    if (this.dot) return this.dot;

    this.slideshow = document.querySelector<HTMLElement>("ds-slideshow");
    if (!this.slideshow) throw new Error("No ds-slideshow element");

    this.dot = document.createElement("div");
    this.dot.className = "ds-laser-pointer";
    Object.assign(this.dot.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, #ff0000 0%, #ff000080 60%, transparent 100%)",
      boxShadow: "0 0 8px 4px #ff000040",
      pointerEvents: "none",
      zIndex: "9999",
      transform: "translate(-50%, -50%)",
      transition: "left 16ms linear, top 16ms linear, opacity 150ms ease",
      opacity: "0",
    });

    this.slideshow.appendChild(this.dot);
    return this.dot;
  }

  update(x: number, y: number, visible: boolean) {
    const dot = this.ensureDot();
    dot.style.left = `${x * 100}%`;
    dot.style.top = `${y * 100}%`;
    dot.style.opacity = visible ? "1" : "0";
  }

  destroy() {
    this.dot?.remove();
    this.dot = null;
  }
}
