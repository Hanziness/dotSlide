/**
 * Server-authoritative presentation state.
 *
 * The Hub maintains the single source of truth for the presentation.
 * This module provides additional state utilities that may be needed
 * beyond what the Hub tracks directly.
 */

import type { NavigationSnapshot } from "@dotslide/protocol";

/**
 * Validate and clamp a navigation index to a safe range.
 *
 * @param index - The requested navigation index
 * @param maxIndex - The maximum valid index (inclusive)
 * @returns The clamped index value
 */
export function clampNavigationIndex(index: number, maxIndex: number): number {
  return Math.max(0, Math.min(index, maxIndex));
}

/**
 * Create an initial navigation snapshot with default values.
 */
export function createInitialSnapshot(): NavigationSnapshot {
  return {
    navigationIndex: 0,
    activeSlide: 0,
    activeStep: 1,
    numSlides: 0,
  };
}
