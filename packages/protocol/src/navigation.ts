import { z } from "zod";

export enum NavigationType {
  slide = "slide",
  step = "step",
}

export const NavigationTypeSchema = z.enum([
  NavigationType.slide,
  NavigationType.step,
]);

export type NavigationNode = {
  type: NavigationType;
  slideIndex: number;
  stepIndex: number;

  /** Auto-generated slide identifier (`slide-${slideIndex}`) */
  slideId: string;
};

export const NavigationNodeSchema = z.object({
  type: NavigationTypeSchema,
  slideIndex: z.number().int().min(0),
  stepIndex: z.number().int().min(1),
  /** Auto-generated slide identifier (`slide-${slideIndex}`) */
  slideId: z.string(),
});

export type NavigationDerivedState = {
  activeSlide: number;
  activeStep: number;
  numSlides: number;
  numNavigationSteps: number;
};

/**
 * Derive presentation navigation state from a flat navigation sequence and
 * the current navigation index.
 */
export function deriveNavigationState(
  sequence: NavigationNode[],
  index: number,
): NavigationDerivedState {
  const node = sequence[index];
  return {
    activeSlide: node?.slideIndex ?? 0,
    activeStep: node?.stepIndex ?? 1,
    numSlides: new Set(sequence.map((entry) => entry.slideIndex)).size,
    numNavigationSteps: sequence.length,
  };
}
