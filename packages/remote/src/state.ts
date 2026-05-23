// TODO Simplify this file

import type { SlideshowContext } from "@dotslide/framework/store";
import { client } from "./rpc-client";

export type PresentationState = Record<string, unknown>;

export function serializePresentationState(
  state: SlideshowContext,
): PresentationState {
  const { root: _root, ...presentationState } = state;
  return presentationState;
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
    console.warn(
      "Failed to upload presentation state",
      await response.text(),
    );
  }
}
