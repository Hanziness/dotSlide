import * as v from "valibot";
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
export const NavigationSnapshotSchema = v.object({
  navigationIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
  navigationSequence: v.array(NavigationNodeSchema),
  numSlides: v.pipe(v.number(), v.integer(), v.minValue(0)),
  activeSlide: v.pipe(v.number(), v.integer(), v.minValue(0)),
  activeStep: v.pipe(v.number(), v.integer(), v.minValue(1)),
  numNavigationSteps: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export type NavigationSnapshot = v.InferOutput<typeof NavigationSnapshotSchema>;

export function createNavigationSnapshot(
  state: SynchronizedPresentationState,
): NavigationSnapshot {
  const derived = deriveNavigationState(
    state.navigationSequence,
    state.navigationIndex,
  );

  return v.parse(NavigationSnapshotSchema, {
    navigationIndex: state.navigationIndex,
    navigationSequence: state.navigationSequence,
    ...derived,
  });
}
