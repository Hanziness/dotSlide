/**
 * CSS injection utility for custom elements.
 * Injects styles into document head once per component.
 */

const injectedStyles = new Set<string>();

/**
 * Inject CSS into the document head.
 * Uses `@layer dotslide` for specificity control.
 * Only injects once per unique CSS content.
 */
export function injectStyles(css: string, id?: string): void {
  const key = id ?? css;
  
  if (injectedStyles.has(key)) {
    return;
  }
  
  // Wrap in @layer if not already wrapped
  const wrappedCss = css.includes("@layer dotslide")
    ? css
    : `@layer dotslide {\n${css}\n}`;
  
  const style = document.createElement("style");
  style.textContent = wrappedCss;
  
  if (id) {
    style.setAttribute("data-dotslide", id);
  }
  
  document.head.appendChild(style);
  injectedStyles.add(key);
}
