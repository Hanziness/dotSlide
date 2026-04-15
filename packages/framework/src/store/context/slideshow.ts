import type { MapStore } from "nanostores";
import { logger } from "../../utils";
import { provideContext, useContext } from ".";
import {
  createNavigationMethods,
  type NavigableContext,
  type NavigationMethods,
  type NavigationNode,
} from "./navigation";

/** Metadata for a single pending async resource */
export type ResourceInfo = {
  /** Index of the slide this resource belongs to (-1 if outside any slide) */
  slideIndex: number;
};

/** Information about a registered counter */
export type CounterInfo = {
  /** Current counter value (starts at 1) */
  value: number;
  /** Optional ID for referencing this counter */
  id?: string;
};

/** Lifecycle phase of the slideshow's resource loading */
export type SlideshowPhase = "registering" | "loading" | "ready";

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

  /** Map of counter types to their instances. Each instance gets a sequential value. */
  counters: Record<string, CounterInfo[]>;

  // — Derived fields (auto-updated when navigationIndex changes) —

  /** Index of the currently visible slide */
  activeSlide: number;
  /** Current step within the active slide (1-based) */
  activeStep: number;
  /** @readonly Total number of unique slides */
  numSlides: number;

  /**
   * Current lifecycle phase.
   * - `"registering"`: synchronous registration window is open
   * - `"loading"`: registration closed, waiting for pending resources
   * - `"ready"`: all registered resources have loaded
   */
  phase: SlideshowPhase;
  /**
   * Map of pending resource IDs to their metadata.
   * Empty record means all resources are loaded.
   */
  pending: Record<string, ResourceInfo>;
  /** Whether the slideshow is ready (derived: `phase === "ready"`) */
  ready: boolean;
};

/** MapStore with navigation methods attached directly on the store object */
export type SlideshowStore = MapStore<SlideshowContext> & NavigationMethods;

/** Fields automatically managed internally */
type DerivedFields =
  | "activeSlide"
  | "activeStep"
  | "numSlides"
  | "phase"
  | "pending"
  | "ready"
  | "counters";

/** Fields derived from navigation state */
type NavigationDerivedFields = "activeSlide" | "activeStep" | "numSlides";

/**
 * Compute derived field values from the current navigation state.
 * Extracted as a pure function so it can be used for both initial
 * values and subsequent updates.
 */
function deriveNavigationState(
  sequence: NavigationNode[],
  index: number,
): Pick<SlideshowContext, NavigationDerivedFields> {
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

  logger.info("Creating slideshow context");
  const store = provideContext<SlideshowContext>(root, {
    ...initialValue,
    root,
    ...deriveNavigationState(navigationSequence, navigationIndex),
    // Readiness state — always starts in the registration window
    phase: "registering",
    pending: {},
    ready: false,
    // Counter state — starts empty, counters register themselves
    counters: {},
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

  // Derive `ready` from `phase` and `pending`.
  // The slideshow is ready when the registration window has closed
  // and no resources are still pending.
  store.listen((_value, _oldValue, changedKey) => {
    if (changedKey !== "phase" && changedKey !== "pending") return;
    const { phase, pending } = store.get();
    const isReady =
      phase !== "registering" && Object.keys(pending).length === 0;

    if (store.get().ready !== isReady) {
      store.setKey("ready", isReady);
      if (isReady) {
        store.setKey("phase", "ready");
      }
    }
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

  logger.debug("Using slideshow context");

  if (ctx === undefined) {
    throw new Error(`No Slideshow context found for ${child.tagName}`, {
      cause: child,
    });
  }

  // Safe: navigation methods were attached at creation time via Object.assign
  return ctx as SlideshowStore;
};
