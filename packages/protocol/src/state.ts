import { z } from "zod";
import {
  deriveNavigationState,
  type NavigationNode,
  NavigationNodeSchema,
} from "./navigation";

/**
 * Selected projection of presentation state allowed to cross the sync boundary.
 * Only the topology and cursor may be serialized into the wire DTO.
 */
export interface SynchronizedPresentationState {
  navigationIndex: number;
  navigationSequence: NavigationNode[];
}

/** Wire DTO snapshot of the selected presentation state projection. */
export const NavigationSnapshotSchema = z.object({
  navigationIndex: z.number().int().min(0),
  navigationSequence: z.array(NavigationNodeSchema),
  numSlides: z.number().int().min(0),
  activeSlide: z.number().int().min(0),
  activeStep: z.number().int().min(1),
  numNavigationSteps: z.number().int().min(0),
});

export type NavigationSnapshot = z.infer<typeof NavigationSnapshotSchema>;

export function createNavigationSnapshot(
  state: SynchronizedPresentationState,
): NavigationSnapshot {
  const derived = deriveNavigationState(
    state.navigationSequence,
    state.navigationIndex,
  );

  return NavigationSnapshotSchema.parse({
    navigationIndex: state.navigationIndex,
    navigationSequence: state.navigationSequence,
    ...derived,
  });
}
