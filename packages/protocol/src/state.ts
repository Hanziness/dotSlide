import { z } from "zod";

/**
 * Selected projection of presentation state allowed to cross the sync boundary.
 * Only these fields may be serialized into the wire DTO.
 */
export interface SynchronizedPresentationState {
  navigationIndex: number;
  numSlides: number;
  activeSlide: number;
  activeStep: number;
  numNavigationSteps: number;
}

/** Wire DTO snapshot of the selected presentation state projection. */
export const NavigationSnapshotSchema = z.object({
  navigationIndex: z.number().int().min(0),
  numSlides: z.number().int().min(0),
  activeSlide: z.number().int().min(0),
  activeStep: z.number().int().min(1),
  numNavigationSteps: z.number().int().min(0),
});

export type NavigationSnapshot = z.infer<typeof NavigationSnapshotSchema>;

export function createNavigationSnapshot(
  state: SynchronizedPresentationState,
): NavigationSnapshot {
  return NavigationSnapshotSchema.parse({
    navigationIndex: state.navigationIndex,
    numSlides: state.numSlides,
    activeSlide: state.activeSlide,
    activeStep: state.activeStep,
    numNavigationSteps: state.numNavigationSteps,
  });
}
