import type { SlideshowContext } from "@dotslide/framework/store";
import {
  createNavigationSnapshot,
  type NavigationSnapshot,
  type SynchronizedPresentationState,
} from "@dotslide/protocol";
import { client } from "./rpc-client";

export function projectPresentationState(
  state: SlideshowContext,
): SynchronizedPresentationState {
  return {
    navigationIndex: state.navigationIndex,
    numSlides: state.numSlides,
    activeSlide: state.activeSlide,
    activeStep: state.activeStep,
    numNavigationSteps: state.navigationSequence.length,
  };
}

export function serializePresentationState(
  state: SynchronizedPresentationState,
): NavigationSnapshot {
  return createNavigationSnapshot(state);
}

export async function uploadPresentationState(
  roomId: string,
  state: SynchronizedPresentationState,
): Promise<void> {
  const response = await client.api.control[":roomId"].metadata.$post({
    param: { roomId },
    json: serializePresentationState(state),
  });

  if (!response.ok) {
    console.warn("Failed to upload presentation state", await response.text());
  }
}
