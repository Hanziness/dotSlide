// TODO Simplify this file

import type { SlideshowContext } from "@dotslide/framework/store";
import {
  type NavigationSnapshot,
  NavigationSnapshotSchema,
} from "@dotslide/protocol";
import { client } from "./rpc-client";

export function serializePresentationState(
  state: SlideshowContext,
): NavigationSnapshot {
  return NavigationSnapshotSchema.parse({
    navigationIndex: state.navigationIndex,
    numSlides: state.numSlides,
    activeSlide: state.activeSlide,
    activeStep: state.activeStep,
    numNavigationSteps: state.navigationSequence.length,
  });
}

export async function uploadPresentationState(
  roomId: string,
  state: SlideshowContext,
): Promise<void> {
  const response = await client.api.control[":roomId"].metadata.$post({
    param: { roomId },
    json: serializePresentationState(state),
  });

  if (!response.ok) {
    console.warn("Failed to upload presentation state", await response.text());
  }
}
