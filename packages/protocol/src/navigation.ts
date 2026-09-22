import * as v from "valibot";

export enum NavigationType {
  slide = "slide",
  step = "step",
}

export const NavigationTypeSchema = v.picklist([
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

export const NavigationNodeSchema = v.object({
  type: NavigationTypeSchema,
  slideIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
  stepIndex: v.pipe(v.number(), v.integer(), v.minValue(1)),
  /** Auto-generated slide identifier (`slide-${slideIndex}`) */
  slideId: v.string(),
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
