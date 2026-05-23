import { z } from "zod";

/** Snapshot of the presentation state, sent on sync */
export const NavigationSnapshotSchema = z.object({
  navigationIndex: z.number().int().min(0),
  numSlides: z.number().int().min(0),
  activeSlide: z.number().int().min(0),
  activeStep: z.number().int().min(1),
  numNavigationSteps: z.number().int().min(0)
});

export type NavigationSnapshot = z.infer<typeof NavigationSnapshotSchema>;
