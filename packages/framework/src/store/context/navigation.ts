import type { MapStore } from "nanostores";

export enum NavigationType {
  slide = "slide",
  step = "step",
}

export type NavigationNode = {
  type: NavigationType;
  slideIndex: number;
  stepIndex: number;

  /** Auto-generated slide identifier (`slide-${slideIndex}`) */
  slideId: string;
};

/** Minimal store shape required by navigation methods */
export type NavigableContext = {
  navigationIndex: number;
  navigationSequence: NavigationNode[];
};

export type NavigationMethods = {
  next(): void;
  prev(): void;
  first(): void;
  last(): void;
  goTo(index: number): void;
};

/** Clamp a navigation index to the valid range `[0, length - 1]`. Returns 0 for empty sequences. */
function clampIndex(index: number, sequenceLength: number): number {
  if (sequenceLength === 0) return 0;
  return Math.max(0, Math.min(index, sequenceLength - 1));
}

/**
 * Create navigation methods bound to a context store.
 *
 * Each method reads the current sequence/index from the store,
 * computes the clamped target index, and writes it back.
 * The generic constraint ensures any store with `navigationIndex`
 * and `navigationSequence` fields is accepted.
 */
export function createNavigationMethods(
  ctx: MapStore<NavigableContext>,
): NavigationMethods {
  return {
    next() {
      const { navigationIndex, navigationSequence } = ctx.get();
      ctx.setKey(
        "navigationIndex",
        clampIndex(navigationIndex + 1, navigationSequence.length),
      );
    },
    prev() {
      const { navigationIndex, navigationSequence } = ctx.get();
      ctx.setKey(
        "navigationIndex",
        clampIndex(navigationIndex - 1, navigationSequence.length),
      );
    },
    first() {
      ctx.setKey("navigationIndex", 0);
    },
    last() {
      const { navigationSequence } = ctx.get();
      ctx.setKey(
        "navigationIndex",
        clampIndex(navigationSequence.length - 1, navigationSequence.length),
      );
    },
    goTo(index: number) {
      const { navigationSequence } = ctx.get();
      ctx.setKey(
        "navigationIndex",
        clampIndex(index, navigationSequence.length),
      );
    },
  };
}
