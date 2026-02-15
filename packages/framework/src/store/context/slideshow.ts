import type { MapStore } from "nanostores";
import { provideContext, useContext } from ".";
import {
  createNavigationMethods,
  type NavigableContext,
  type NavigationMethods,
  type NavigationNode,
} from "./navigation";

export type SlideshowContext = {
  id: string;
  width: number;
  height: number;
  /** Root element of the Slideshow */
  root: HTMLElement;

  // — Navigation state —

  /** Current position in the navigation sequence */
  navigationIndex: number;
  /** Full navigation sequence (built once at init) */
  navigationSequence: NavigationNode[];

  // — Derived fields (auto-updated when navigationIndex changes) —

  /** Index of the currently visible slide */
  activeSlide: number;
  /** Current step within the active slide (1-based) */
  activeStep: number;
  /** @readonly Total number of unique slides */
  numSlides: number;
};

/** MapStore with navigation methods attached directly on the store object */
export type SlideshowStore = MapStore<SlideshowContext> & NavigationMethods;

/** Fields automatically derived from the navigation state */
type DerivedFields = "activeSlide" | "activeStep" | "numSlides";

/**
 * Compute derived field values from the current navigation state.
 * Extracted as a pure function so it can be used for both initial
 * values and subsequent updates.
 */
function deriveNavigationState(
  sequence: NavigationNode[],
  index: number,
): Pick<SlideshowContext, DerivedFields> {
  const node = sequence[index];
  return {
    activeSlide: node?.slideIndex ?? 0,
    activeStep: node?.stepIndex ?? 1,
    numSlides: new Set(sequence.map((n) => n.slideIndex)).size,
  };
}

export const createSlideshowContext = (
  root: HTMLElement,
  initialValue: Omit<SlideshowContext, "root" | DerivedFields>,
): SlideshowStore => {
  const { navigationSequence, navigationIndex } = initialValue;

  console.info("Creating slideshow context");
  const store = provideContext<SlideshowContext>(root, {
    ...initialValue,
    root,
    ...deriveNavigationState(navigationSequence, navigationIndex),
  });

  // Keep derived fields in sync when navigationIndex changes.
  // Each setKey call notifies subscribers with the specific changedKey,
  // so existing consumers filtering on "activeSlide" still work.
  store.listen((_value, _oldValue, changedKey) => {
    if (changedKey !== "navigationIndex") return;
    const { navigationSequence: seq, navigationIndex: idx } = store.get();
    const node = seq[idx];
    store.setKey("activeSlide", node?.slideIndex ?? 0);
    store.setKey("activeStep", node?.stepIndex ?? 1);
  });

  // Attach navigation methods directly on the store object
  const methods = createNavigationMethods(
    store as unknown as MapStore<NavigableContext>,
  );
  return Object.assign(store, methods);
};

/** Returns a Slideshow context with navigation methods
 *
 * @throws Throws an error if there is no available Slideshow context
 */
export const useSlideshowContext = (child: HTMLElement): SlideshowStore => {
  const ctx = useContext<SlideshowContext>(child, "ds-slideshow");

  console.info("Using slideshow context");

  if (ctx === undefined) {
    throw new Error(`No Slideshow context found for ${child.tagName}`, {
      cause: child,
    });
  }

  // Safe: navigation methods were attached at creation time via Object.assign
  return ctx as SlideshowStore;
};
